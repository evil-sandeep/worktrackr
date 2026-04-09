// This file is processed and loaded automatically before your test files.
// You can read more here: https://on.cypress.io/configuration

import './commands';

// Mocking Geolocation and Camera for all tests
Cypress.on('window:before:load', (win) => {
  // Mock Geolocation
  const latitude = 12.9716;
  const longitude = 77.5946;
  cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((cb) => {
    return cb({ coords: { latitude, longitude } });
  });

  // Mock navigator.mediaDevices.getUserMedia for Camera
  if (win.navigator.mediaDevices && win.navigator.mediaDevices.getUserMedia) {
    cy.stub(win.navigator.mediaDevices, 'getUserMedia').callsFake(() => {
      // Return a fake stream
      return Promise.resolve(new MediaStream());
    });
  }
});
