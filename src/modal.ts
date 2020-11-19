/* CMPT 315 (Fall 2020)
    Project 2
   Author: Eric Wedemire
*/

/*
 * 
 */
function onModalButtonClick() {
    window.location.href = "/";
}


function modal() {
    const modal: HTMLDivElement | null = document.querySelector('.modal');
    if (modal) {
       const modalButton: HTMLButtonElement | null = document.querySelector('#modal-button');
       const modalText: HTMLParagraphElement | null = document.querySelector('#modal-text');
       if (modalButton && modalText) {
          modalButton.textContent = "MODAL BUTTON"
          modalText.textContent = "MODAL BOX"
          modalButton.addEventListener("click", onModalButtonClick);
       }
       modal.style.display = "grid";
    }
}

/*
 * onModalHide will hide the modal box
 */
function onModalHide() {
    const modal: HTMLDivElement | null = document.querySelector('.modal');
    if (modal) {
       modal.style.display = "none";
    }
 }