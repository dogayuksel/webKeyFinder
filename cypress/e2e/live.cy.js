describe('live key analysis', () => {
  describe('routing', () => {
    it('should display the title on root path', () => {
      cy.visit('/');
      cy.get('header h1').should('have.text', 'Live Key Detection');
    });

    it('should display the title on /live path', () => {
      cy.visit('/live');
      cy.get('header h1').should('have.text', 'Live Key Detection');
    });
  });

  describe('key detection', () => {
    it('should perform key detection', () => {
      cy.visit('/');
      cy.get('input[value="Route sound to key detection engine"]').click();
      cy.get('input[value="Key detection engine running"]');
      cy.get('input[value="Start Key Detection"]').click();
      cy.get('div').contains('Progressive Result', { timeout: 5000 });
      cy.wait(80000);
      cy.get('div').contains('Progressive Result: Gm');
      cy.wait(10000);
      cy.get('div').contains('Progressive Result: Gm');
      cy.get('input[value="End Key Detection"]').click();
      cy.get('div').contains('Final Result: Gm');
    });
  });
});
