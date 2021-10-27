import { Grid } from '@freecodecamp/react-bootstrap';
import React from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';

import AsSeenIn from './components/AsSeenIn';
import Certifications from './components/Certifications';
import LandingTop from './components/LandingTop';
import Testimonials from './components/Testimonials';

import './landing.css';

function Landing({ page = 'landing' }: { page: string }): JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('metaTags:title')}</title>
      </Helmet>
      <main className='landing-page'>
        <Grid>
          <LandingTop page={page} />
        </Grid>
        <Grid fluid={true}>
          <AsSeenIn />
        </Grid>
        <Grid>
          <Testimonials />
          <Certifications />
        </Grid>
      </main>
    </>
  );
}

Landing.displayName = 'Landing';
export default Landing;
