// Subterra selection list related functions
const selection = (() => {

  // Add selected option as a new selection list item
  const add = option => {
    const formInput = document.querySelector(`input[name="${ option }"]`);
    const formSelect = event.target;
    const selectionList = event.target.parentNode.parentNode.querySelector('ul');
    const selectionListItems = selectionList.querySelectorAll('li');
    const currentItems = formInput.value.split(',').filter(e => {
      // Removes empty data fields
      return e;
    });

    // Check if option has already been added
    if (currentItems.indexOf(formSelect.value) === -1) {
      const newItem = document.createElement('li');

      // Set order to new list item
      newItem.setAttribute('data-order', currentItems.length);

      newItem.insertAdjacentHTML(
        'afterbegin',
        `<span data-type="${ option }-name">${ formSelect.value }</span>
        <ul data-list="selection-features">
          <li>
            <button data-action="move-up" title="Move selection up" onclick="selection.order('${ option }', 'up')">
              <span>Move up</span>
            </button>
          </li>
          <li>
            <button data-action="move-down" title="Move selection down" onclick="selection.order('${ option }', 'down')">
              <span>Move up</span>
            </button>
          </li>
          <li>
            <button data-action="delete" title="Delete selection" onclick="selection.delete('${ option }')">
              <span>Delete</span>
            </button>
          </li>
        </ul>`
      );

      // Append new option to DOM list
      selectionList.appendChild(newItem);

      // Check and update buttons to be disabled
      updateButtons(selectionList);

      // Add newly added option to input
      currentItems.push(formSelect.value);

      if (currentItems.length === 1) {
        formInput.value = formSelect.value;
      } else {
        formInput.value = currentItems.join(',').replace(', ', ',');
      }
    }

    // Reset index of selection element
    formSelect.selectedIndex = 0;
  };

  // Remove an option from selection list items
  const remove = option => {
    const field = event.target.parentNode.parentNode.parentNode.parentNode.parentNode;
    const formInput = field.querySelector(`input[name="${ option }"]`);
    const selectionList = field.querySelector('ul');
    let selectionListItems;
    const currentInput = formInput.value.split(',');

    const content = event.target.parentNode.parentNode.parentNode.querySelector(`[data-type="${ option }-name"]`).textContent;
    const contentIndex = currentInput.indexOf(content);

    // Remove option from input values
    currentInput.splice(contentIndex, 1);

    // Remove option from DOM list
    selectionList.removeChild(selectionList.children[contentIndex]);

    // Reset order attribute of selection list items
    selectionListItems= selectionList.querySelectorAll(':scope > li');
    selectionListItems.forEach((item, index) => {
      item.setAttribute('data-order', index);
    });

    // Check and update feature buttons to be disabled
    updateButtons(selectionList);

    // Remove option from hidden input
    formInput.value = currentInput.join(',').replace(', ', ',');
  };

  // Set selection order based on given direction
  const order = (option, direction) => {
    const field = event.target.parentNode.parentNode.parentNode.parentNode.parentNode;
    const formInput = field.querySelector(`input[name="${ option }"]`);
    const selectionList = field.querySelector('ul');
    const selections = selectionList.querySelectorAll('li[data-order]');
    const selectionTarget = event.target.parentNode.parentNode.parentNode;
    const curPos = Number(selectionTarget.getAttribute('data-order'));
    let newPos
    let newOrderHTML = Array.from(selections);
    let newOrderInput = [];

    switch (direction) {
      case 'up':
        // Early exit when selection is already in top position;
        if (curPos === 0) {
          break;
        }

        // Define new order to be set
        newPos = curPos - 1;

        // Reassign selection list
        newOrderHTML.forEach(selection => {
          const order = Number(selection.getAttribute('data-order'));

          if (order === newPos) {
            selection.setAttribute('data-order', order + 1);
          } else if (order === curPos) {
            // Set desired selection in place
            selection.setAttribute('data-order', newPos);
          }
        });
      break;
      case 'down':
        // Early exit when selection is already in bottom position;
        if (curPos === (selections.length - 1)) {
          break;
        }

        // Define new order to be set
        newPos = curPos + 1;

        // Reassign selection list
        newOrderHTML.forEach(selection => {
          const order = Number(selection.getAttribute('data-order'));

          if (order === newPos) {
            selection.setAttribute('data-order', order - 1);
          } else if (order === curPos) {
            // Set desired selection in place
            selection.setAttribute('data-order', newPos);
          }
        });
      break;
    }

    // Remove all selections from list
    while (selectionList.children[0]) {
      selectionList.removeChild(selectionList.children[0]);
    }

    // Sort new order array
    newOrderHTML.sort((a, b) => {
      return Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order'));
    });

    newOrderHTML.forEach(selection => {
      // Push name of selection item in input array
      newOrderInput.push(selection.querySelector(`[data-type="${ option }-name"]`).textContent);

      selectionList.insertAdjacentHTML(
        'beforeend',
        selection.outerHTML
      );
    });

    // Check and update buttons to be disabled
    updateButtons(selectionList);

    // Set new order in hidden input
    formInput.value = newOrderInput.join(',');
  };

  // Check and update buttons to be disabled
  const updateButtons = list => {
    const selectionItems = list.querySelectorAll('li[data-order]');

    // Check every single item
    selectionItems.forEach((item, index) => {
      const moveUp = item.querySelector('button[data-action="move-up"]');
      const moveDown = item.querySelector('button[data-action="move-down"]');

      index === 0 ? moveUp.disabled = true : moveUp.disabled = false;
      index === selectionItems.length - 1 ? moveDown.disabled = true : moveDown.disabled = false;
    });
  };

  // Export functions
  return {
    add: add,
    order: order,
    delete: remove
  };
})();
