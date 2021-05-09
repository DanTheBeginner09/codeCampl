/* global cy */
const superBlockPath = require('../../../fixtures/pathData/challenges/responsive-web-design.json');

const blocks = Object.entries(
  superBlockPath['blocks']['responsive-web-design-principles']
);

for (const [challengeName, challengePath] of blocks) {
  describe('loading challenge', () => {
    before(() => {
      cy.visit(challengePath);
    });

    it('Challenge' + challengeName + ' should work correctly', () => {
      cy.testChallenges(challengePath);
    });
  });
}
