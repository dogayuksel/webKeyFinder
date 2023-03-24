describe('live key analysis', () => {
  describe('routing', () => {
    it('should display the title on root path', () => {
      cy.visit('localhost:3000');
      cy.get('header h1').should('have.text', 'Live Key Detection');
    });

    it('should display the title on /live path', () => {
      cy.visit('localhost:3000/live');
      cy.get('header h1').should('have.text', 'Live Key Detection');
    });
  });

  describe('key detection', () => {
    it('should perform key detection', () => {
      cy.visit('localhost:3000');
      cy.get('main input').first().click();
      cy.get('input[value="Key detection engine running"]');
      cy.get('input[value="Start Key Detection"]').click();
      cy.get('div').contains('Progressive Result', { timeout: 20000 });
      cy.wait(30000);
      cy.get('div').contains('Progressive Result: Gm');
      cy.wait(10000);
      cy.get('div').contains('Progressive Result: Gm');
      cy.get('input[value="End Key Detection"]').click();
      cy.get('div').contains('Final Result: Gm');
    });
  });
});
