import { graphql } from 'gatsby';
import React, { useState, useEffect, MutableRefObject } from 'react';
import Helmet from 'react-helmet';
import { TFunction, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { HandlerProps } from 'react-reflex';
import Media from 'react-responsive';
import { bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import store from 'store';
import { editor } from 'monaco-editor';
import { challengeTypes } from '../../../../utils/challenge-types';
import LearnLayout from '../../../components/layouts/learn';
import { MAX_MOBILE_WIDTH } from '../../../../../config/misc';

import {
  ChallengeFiles,
  ChallengeMeta,
  ChallengeNode,
  CompletedChallenge,
  ResizeProps,
  SavedChallengeFiles,
  Test
} from '../../../redux/prop-types';
import { isContained } from '../../../utils/is-contained';
import ChallengeDescription from '../components/challenge-description';
import Hotkeys from '../components/hotkeys';
import ResetModal from '../components/reset-modal';
import ChallengeTitle from '../components/challenge-title';
import CompletionModal from '../components/completion-modal';
import HelpModal from '../components/help-modal';
import ShortcutsModal from '../components/shortcuts-modal';
import Notes from '../components/notes';
import Output from '../components/output';
import Preview from '../components/preview';
import ProjectPreviewModal from '../components/project-preview-modal';
import SidePanel from '../components/side-panel';
import VideoModal from '../components/video-modal';
import {
  cancelTests,
  challengeMounted,
  createFiles,
  executeChallenge,
  initConsole,
  initTests,
  previewMounted,
  updateChallengeMeta,
  openModal,
  setEditorFocusability,
  setIsAdvancing
} from '../redux/actions';
import {
  challengeFilesSelector,
  challengeTestsSelector,
  consoleOutputSelector,
  isChallengeCompletedSelector
} from '../redux/selectors';
import { savedChallengesSelector } from '../../../redux/selectors';
import { getGuideUrl } from '../utils';
import MultifileEditor from './multifile-editor';
import DesktopLayout from './desktop-layout';
import MobileLayout from './mobile-layout';

import './classic.css';
import '../components/test-frame.css';

// Redux Setup
const mapStateToProps = createStructuredSelector({
  challengeFiles: challengeFilesSelector,
  tests: challengeTestsSelector,
  output: consoleOutputSelector,
  isChallengeCompleted: isChallengeCompletedSelector,
  savedChallenges: savedChallengesSelector
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      createFiles,
      initConsole,
      initTests,
      updateChallengeMeta,
      challengeMounted,
      executeChallenge,
      cancelTests,
      previewMounted,
      openModal,
      setEditorFocusability,
      setIsAdvancing
    },
    dispatch
  );

// Types
interface ShowClassicProps {
  cancelTests: () => void;
  challengeMounted: (arg0: string) => void;
  createFiles: (arg0: ChallengeFiles | SavedChallengeFiles) => void;
  data: { challengeNode: ChallengeNode };
  executeChallenge: (options?: { showCompletionModal: boolean }) => void;
  challengeFiles: ChallengeFiles;
  initConsole: (arg0: string) => void;
  initTests: (tests: Test[]) => void;
  isChallengeCompleted: boolean;
  output: string[];
  pageContext: {
    challengeMeta: ChallengeMeta;
    projectPreview: {
      challengeData: CompletedChallenge;
      showProjectPreview: boolean;
    };
  };
  t: TFunction;
  tests: Test[];
  updateChallengeMeta: (arg0: ChallengeMeta) => void;
  openModal: (modal: string) => void;
  setEditorFocusability: (canFocus: boolean) => void;
  setIsAdvancing: (arg: boolean) => void;
  previewMounted: () => void;
  savedChallenges: CompletedChallenge[];
}

interface ReflexLayout {
  codePane: { flex: number };
  editorPane: { flex: number };
  instructionPane: { flex: number };
  notesPane: { flex: number };
  previewPane: { flex: number };
  testsPane: { flex: number };
}

interface RenderEditorArgs {
  isMobileLayout: boolean;
  isUsingKeyboardInTablist: boolean;
}

const REFLEX_LAYOUT = 'challenge-layout';
const BASE_LAYOUT = {
  codePane: { flex: 1 },
  editorPane: { flex: 1 },
  instructionPane: { flex: 1 },
  previewPane: { flex: 0.7 },
  notesPane: { flex: 0.7 },
  testsPane: { flex: 0.3 }
};

// Used to prevent monaco from stealing mouse/touch events on the upper jaw
// content widget so they can trigger their default actions. (Issue #46166)
const handleContentWidgetEvents = (e: MouseEvent | TouchEvent): void => {
  const target = e.target as HTMLElement;
  if (target?.closest('.editor-upper-jaw')) {
    e.stopPropagation();
  }
};

// Component
function ShowClassic({
  data: {
    challengeNode: {
      challenge,
      challenge: {
        challengeFiles,
        block,
        title,
        fields: { tests, blockName },
        challengeType,
        removeComments,
        hasEditableBoundaries,
        superBlock,
        helpCategory,
        forumTopicId,
        certification,
        usesMultifileEditor,
        notes
      }
    }
  },
  pageContext: {
    challengeMeta,
    challengeMeta: { isFirstStep, nextChallengePath, prevChallengePath },
    projectPreview: { challengeData, showProjectPreview }
  },
  createFiles,
  cancelTests,
  challengeMounted,
  initConsole,
  initTests,
  updateChallengeMeta,
  openModal,
  setIsAdvancing,
  savedChallenges,
  t,
  isChallengeCompleted,
  output,
  executeChallenge
}: ShowClassicProps) {
  const onStopResize = (event: HandlerProps) => {
    const { name, flex } = event.component.props;

    // Only interested in tracking layout updates for ReflexElement's
    if (!name) {
      setResizing(false);
      return;
    }

    // Forcing a state update with the value of each panel since on stop resize
    // is executed per each panel.
    if (typeof layout === 'object')
      setLayout({
        ...layout,
        [name]: { flex }
      });
    setResizing(false);

    store.set(REFLEX_LAYOUT, layout);
  };
  const onResize = () => {
    setResizing(true);
  };
  const resizeProps: ResizeProps = {
    onResize,
    onStopResize
  };

  const getLayoutState = (): ReflexLayout => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const reflexLayout: ReflexLayout = store.get(REFLEX_LAYOUT);

    // Validate if user has not done any resize of the panes
    if (!reflexLayout) return BASE_LAYOUT;

    // Check that the layout values stored are valid (exist in base layout). If
    // not valid, it will fallback to the base layout values and be set on next
    // user resize.
    const isValidLayout = isContained(
      Object.keys(BASE_LAYOUT),
      Object.keys(reflexLayout)
    );

    return isValidLayout ? reflexLayout : BASE_LAYOUT;
  };

  // layout: Holds the information of the panes sizes for desktop view
  const [layout, setLayout] = useState(getLayoutState());
  const [resizing, setResizing] = useState(false);
  const [usingKeyboardInTablist, setUsingKeyboardInTablist] = useState(false);

  const containerRef = React.createRef<HTMLElement>();
  const editorRef = React.createRef();
  const instructionsPanelRef = React.createRef<HTMLDivElement>();

  const updateUsingKeyboardInTablist = (
    usingKeyboardInTablist: boolean
  ): void => {
    setUsingKeyboardInTablist(usingKeyboardInTablist);
  };

  useEffect(() => {
    initializeComponent(title);
    // Bug fix for the monaco content widget and touch devices/right mouse
    // click. (Issue #46166)
    document.addEventListener('mousedown', handleContentWidgetEvents, true);
    document.addEventListener('contextmenu', handleContentWidgetEvents, true);
    document.addEventListener('touchstart', handleContentWidgetEvents, true);
    document.addEventListener('touchmove', handleContentWidgetEvents, true);
    document.addEventListener('touchend', handleContentWidgetEvents, true);

    return () => {
      createFiles([]);
      cancelTests();
      document.removeEventListener(
        'mousedown',
        handleContentWidgetEvents,
        true
      );
      document.removeEventListener(
        'contextmenu',
        handleContentWidgetEvents,
        true
      );
      document.removeEventListener(
        'touchstart',
        handleContentWidgetEvents,
        true
      );
      document.removeEventListener(
        'touchmove',
        handleContentWidgetEvents,
        true
      );
      document.removeEventListener('touchend', handleContentWidgetEvents, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initializeComponent(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tests, title]);

  const initializeComponent = (title: string): void => {
    initConsole('');

    const savedChallenge = savedChallenges?.find(challenge => {
      return challenge.id === challengeMeta.id;
    });

    createFiles(savedChallenge?.challengeFiles || challengeFiles || []);

    initTests(tests);
    if (showProjectPreview) openModal('projectPreview');
    updateChallengeMeta({
      ...challengeMeta,
      title,
      removeComments: removeComments !== false,
      challengeType,
      helpCategory
    });
    challengeMounted(challengeMeta.id);
    setIsAdvancing(false);
  };

  const getChallenge = () => challenge;

  const getBlockNameTitle = (t: TFunction): string => {
    const { block, superBlock, title } = getChallenge();
    return `${t(`intro:${superBlock}.blocks.${block}.title`)}: ${title}`;
  };

  const getVideoUrl = () => getChallenge().videoUrl;

  const hasPreview = () => {
    const { challengeType } = getChallenge();
    return (
      challengeType === challengeTypes.html ||
      challengeType === challengeTypes.modern ||
      challengeType === challengeTypes.multifileCertProject
    );
  };

  const renderInstructionsPanel = ({
    showToolPanel
  }: {
    showToolPanel: boolean;
  }) => {
    const {
      block,
      description,
      forumTopicId,
      instructions,
      title,
      translationPending
    } = getChallenge();

    return (
      <SidePanel
        block={block}
        challengeDescription={
          <ChallengeDescription
            block={block}
            description={description}
            instructions={instructions}
          />
        }
        challengeTitle={
          <ChallengeTitle
            isCompleted={isChallengeCompleted}
            translationPending={translationPending}
          >
            {title}
          </ChallengeTitle>
        }
        guideUrl={getGuideUrl({ forumTopicId, title })}
        instructionsPanelRef={instructionsPanelRef}
        showToolPanel={showToolPanel}
        videoUrl={getVideoUrl()}
      />
    );
  };

  const renderEditor = ({
    isMobileLayout,
    isUsingKeyboardInTablist
  }: RenderEditorArgs) => {
    /* challengeFiles is pulled from data here instead of props*/

    const { description, title } = getChallenge();
    return (
      challengeFiles && (
        <MultifileEditor
          challengeFiles={challengeFiles}
          containerRef={containerRef}
          description={description}
          // Try to remove unknown
          editorRef={
            editorRef as MutableRefObject<editor.IStandaloneCodeEditor>
          }
          initialTests={tests}
          isMobileLayout={isMobileLayout}
          isUsingKeyboardInTablist={isUsingKeyboardInTablist}
          resizeProps={resizeProps}
          title={title}
          usesMultifileEditor={usesMultifileEditor}
          showProjectPreview={showProjectPreview}
        />
      )
    );
  };

  const renderTestOutput = () => {
    return (
      <Output
        defaultOutput={`
/**
* ${t('learn.test-output')}
*/
`}
        output={output}
      />
    );
  };

  const renderNotes = (notes?: string) => {
    return <Notes notes={notes} />;
  };

  const renderPreview = () => {
    return (
      <Preview
        className='full-height'
        disableIframe={resizing}
        previewMounted={previewMounted}
      />
    );
  };

  const blockNameTitle = getBlockNameTitle(t);
  const windowTitle = `${blockNameTitle} | freeCodeCamp.org`;

  /* challengeFiles is pulled from data here instead of props*/
  return (
    <Hotkeys
      challengeType={challengeType}
      editorRef={editorRef as React.RefObject<HTMLElement>}
      executeChallenge={executeChallenge}
      innerRef={containerRef}
      instructionsPanelRef={instructionsPanelRef}
      nextChallengePath={nextChallengePath}
      prevChallengePath={prevChallengePath}
      usesMultifileEditor={usesMultifileEditor}
    >
      <LearnLayout>
        <Helmet title={windowTitle} />
        <Media maxWidth={MAX_MOBILE_WIDTH}>
          <MobileLayout
            editor={renderEditor({
              isMobileLayout: true,
              isUsingKeyboardInTablist: usingKeyboardInTablist
            })}
            guideUrl={getGuideUrl({ forumTopicId, title })}
            hasEditableBoundaries={hasEditableBoundaries}
            hasNotes={!!notes}
            hasPreview={hasPreview()}
            instructions={renderInstructionsPanel({
              showToolPanel: false
            })}
            notes={renderNotes(notes)}
            preview={renderPreview()}
            testOutput={renderTestOutput()}
            // eslint-disable-next-line @typescript-eslint/unbound-method
            updateUsingKeyboardInTablist={updateUsingKeyboardInTablist}
            usesMultifileEditor={usesMultifileEditor}
            videoUrl={getVideoUrl()}
          />
        </Media>
        <Media minWidth={MAX_MOBILE_WIDTH + 1}>
          <DesktopLayout
            challengeFiles={challengeFiles}
            challengeType={challengeType}
            editor={renderEditor({
              isMobileLayout: false,
              isUsingKeyboardInTablist: usingKeyboardInTablist
            })}
            hasEditableBoundaries={hasEditableBoundaries}
            hasNotes={!!notes}
            hasPreview={hasPreview()}
            instructions={renderInstructionsPanel({
              showToolPanel: true
            })}
            isFirstStep={isFirstStep}
            layoutState={layout}
            notes={renderNotes(notes)}
            preview={renderPreview()}
            resizeProps={resizeProps}
            testOutput={renderTestOutput()}
            windowTitle={windowTitle}
          />
        </Media>
        <CompletionModal
          block={block}
          blockName={blockName}
          certification={certification}
          superBlock={superBlock}
        />
        <HelpModal challengeTitle={title} challengeBlock={blockName} />
        <VideoModal videoUrl={getVideoUrl()} />
        <ResetModal />
        <ProjectPreviewModal
          challengeData={challengeData}
          closeText={t('buttons.start-coding')}
          previewTitle={t('learn.project-preview-title')}
          showProjectPreview={showProjectPreview}
        />
        <ShortcutsModal />
      </LearnLayout>
    </Hotkeys>
  );
}

ShowClassic.displayName = 'ShowClassic';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(ShowClassic));

export const query = graphql`
  query ClassicChallenge($slug: String!) {
    challengeNode(challenge: { fields: { slug: { eq: $slug } } }) {
      challenge {
        block
        title
        description
        id
        hasEditableBoundaries
        instructions
        notes
        removeComments
        challengeType
        helpCategory
        videoUrl
        superBlock
        certification
        translationPending
        forumTopicId
        fields {
          blockName
          slug
          tests {
            text
            testString
          }
        }
        required {
          link
          src
        }
        usesMultifileEditor
        challengeFiles {
          fileKey
          ext
          name
          contents
          head
          tail
          editableRegionBoundaries
          history
        }
      }
    }
  }
`;
