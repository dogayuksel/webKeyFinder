// support/index.js
Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'error');
});
