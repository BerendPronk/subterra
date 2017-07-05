// Subterra utility functions
const utils = (() => {

  // Hide/show an element
  const toggleShow = element => {
    const toToggle = document.querySelector(element);

    toToggle.classList.toggle('hidden');

    event.preventDefault();
  };

  // Remove item from database
  const removeItem = (category, id) => {
    if (confirm('Are you sure you want to delete this?') === true) {
      window.location = `/subterra/${ category }/delete/${ id }`;
    }
  };

  // Export functions
  return {
    toggleShow: toggleShow,
    removeItem: removeItem
  };
})();
