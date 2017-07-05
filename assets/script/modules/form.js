// Subterra form related functions
const form = (() => {

  // Initialize form submit check
  const init = () => {
    if (disabledPaths.indexOf(location.pathname) === -1) {
      // Alert user before page unload to prevent data loss
      window.onbeforeunload = () => {
        if (!submitCheck) {
          return 'You may have some unsaved changes, do you really want to leave this page?';
        } else {
          return;
        }
      };
    }
  };

  // Set submit check to false on default
  let submitCheck = false;

  // Paths that should not be checked with a alert on page refresh
  const disabledPaths = [
    '/subterra',
    '/subterra/',
    '/subterra/login',
    '/subterra/search/',
    '/subterra/types',
    '/subterra/menus',
    '/subterra/pages'
  ];

  // Set submit check to active
  const submit = () => {
    submitCheck = true;
  };

  // Export functions
  return {
    init: init,
    submitCheck: submitCheck,
    disabledPaths: disabledPaths,
    submit: submit
  };
})();
