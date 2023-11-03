describe('about', () => {
  it('should display the title on root path', () => {
    cy.visit('/');
    cy.get('nav a').contains('About').click();
    cy.get('header h1').should('have.text', 'About');
    expect(cy.get('main div p').contains('Source code is available')).to.exist;
  });
});
