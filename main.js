
/**
 * Move the cursor from left bar (0) to right bar (100). 
 * Numbers out of the bounds will be processed as 0 or 100. 
 * @param {number} i An integer [0, 100]
 */
function moveCursor(i) {
    let rect = document.querySelector(".left-bar").getBoundingClientRect();
    let leftEnd = rect.left + (rect.right - rect.left)/2;
    let rightEnd = window.innerWidth - leftEnd;

    let cursorRect = document.querySelector(".cursor").getBoundingClientRect();
    let cursorWidth = cursorRect.right - cursorRect.left;

    if (i > 100) i = 100;
    if (i < 0) i = 0;

    let newCursorX = i * (rightEnd - leftEnd) / 100 + leftEnd;
    document.querySelector(".cursor").style["margin-left"] = `${newCursorX - cursorWidth/2}px`;
}