describe('Attendance Flow', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[name="email"]').type('employee1@example.com'); // Using a seed employee if exists
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to check-in and capture image', () => {
    // Assuming there's a navigation to Check-In or it's on the dashboard
    cy.contains('Check-In').click();
    
    // Check if camera UI is active (BiometricTerminal)
    cy.contains('Start Camera').should('be.visible');
    cy.contains('Start Camera').click();
    
    // In our mocked setup, camera should "start" immediately
    // Wait for "verified entry" or the snapshot button
    // The capture button has a Camera icon. Let's look for the text if any.
    // Based on BiometricTerminal.jsx:
    cy.get('button').find('svg').should('exist');
    
    // Assuming we click the capture button (the one with the blue circle in check-in)
    cy.get('button').filter(':has(.bg-blue-600)').click({force: true});
    
    // Check if "Finalize Entry" appears
    cy.contains('Finalize Entry').should('be.visible');
    cy.contains('Finalize Entry').click();
    
    // Toast should appear
    cy.contains('Check-In logged successfully!').should('be.visible');
  });

  it('should allow check-out after check-in', () => {
    cy.contains('Check-Out').click();
    cy.contains('Start Camera').click();
    
    // Capture
    cy.get('button').filter(':has(.bg-rose-600)').click({force: true});
    
    // Finalize
    cy.contains('Finalize Exit').should('be.visible');
    cy.contains('Finalize Exit').click();
    
    cy.contains('Check-Out logged successfully!').should('be.visible');
  });
});
