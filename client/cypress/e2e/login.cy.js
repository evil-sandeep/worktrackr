describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login page correctly', () => {
    cy.get('h2').should('contain', 'Account Login');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });

  it('should show error on invalid credentials', () => {
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Check for toast/error message - assuming your UI uses terminology like "Invalid"
    cy.contains('Invalid').should('be.visible');
  });

  it('should login successfully with admin credentials', () => {
    // Note: This relies on the seed data from seedAdmin.js
    cy.get('input[name="email"]').type('admin@worktrackr.com');
    cy.get('input[name="password"]').type('Admin@123');
    cy.get('button[type="submit"]').click();

    // Check if redirected to dashboard
    cy.url().should('include', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.exist;
    });
  });
});
