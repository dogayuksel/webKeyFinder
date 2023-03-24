describe('file key analysis', () => {
  it('should determine the key of an uploaded audio file', () => {
    cy.visit('localhost:3000');
    cy.get('nav a').contains('File Analysis').click();
    cy.get('header h1').should('have.text', 'Audio File Key Detection');
    cy.get('[id="load-a-track"]').attachFile('Mindseye - Interstellar.mp3');

    cy.get('[class=file-item__song-name]').contains(
      'Mindseye - Interstellar.mp3'
    );
    cy.get('[class=file-item__result-text]').contains('Gm', { timeout: 20000 });
  });
});
