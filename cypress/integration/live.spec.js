describe('live key analysis', () => {
  describe('routing', () => {
    it('should display the title on root path', () => {
      cy.visit('localhost:3000')
      cy.get('header h1').should('have.text', 'Live Key Detection')
    })

    it('should display the title on /live path', () => {
      cy.visit('localhost:3000/live')
      cy.get('header h1').should('have.text', 'Live Key Detection')
    })
  })
})
