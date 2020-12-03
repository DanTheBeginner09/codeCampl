const { root } = require('mdast-builder');
const getAllBetween = require('../../../mdx/plugins/utils/between-headings');
const {
  splitOnThematicBreak
} = require('../../../mdx/plugins/utils/split-on-thematic-break');

const { stringifyMd } = require('./text-to-data');

function plugin() {
  return transformer;

  function transformer(tree, file) {
    const questionNodes = getAllBetween(tree, '--question--');
    if (questionNodes.length > 0) {
      const questionTree = root(questionNodes);
      const textNodes = getAllBetween(questionTree, '--text--');
      const answersNodes = getAllBetween(questionTree, '--answers--');
      const solutionNodes = getAllBetween(questionTree, '--video-solution--');

      const question = getQuestion(textNodes, answersNodes, solutionNodes);

      file.data.question = question;
    }
  }
}

function getQuestion(textNodes, answersNodes, solutionNodes) {
  const text = stringifyMd(textNodes);
  const answers = getAnswers(answersNodes);
  const solution = getSolution(solutionNodes);

  if (!text) throw Error('text is missing from question');
  if (!answers) throw Error('answers are missing from question');
  if (!solution) throw Error('solution is missing from question');

  return { text, answers, solution };
}

function getAnswers(answersNodes) {
  const answerGroups = splitOnThematicBreak(answersNodes);
  return answerGroups.map(answer => stringifyMd(answer));
}

function getSolution(solutionNodes) {
  let solution;
  try {
    if (solutionNodes.length > 1) throw Error('Too many nodes');
    if (solutionNodes[0].children.length > 1)
      throw Error('Too many child nodes');
    const solutionString = solutionNodes[0].children[0].value;
    if (solutionString === '') throw Error('Non-empty string required');

    solution = Number(solutionString);
    if (Number.isNaN(solution)) throw Error('Not a number');
    if (solution < 1) throw Error('Not positive number');
  } catch (e) {
    console.log(e);
    throw Error('A video solution should be a positive integer');
  }

  return solution;
}

module.exports = plugin;
