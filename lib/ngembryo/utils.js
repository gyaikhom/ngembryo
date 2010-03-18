/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 * @version 0.0.1
 */

/**
 * Destroys child subtree.
 */
function destroyChildSubtree(node) {
	if (node.hasChildNodes()) {
		while (node.childNodes.length >= 1) {
			destroyChildSubtree(node.firstChild);
			node.removeChild(node.firstChild);
		}
	}
}

/**
 * Finds the screen position relative to container.
 * 
 * @param elementID
 *            The unique identifier of the element.
 * @param containerID
 *            The unique identifier of the final container.
 */
function findPos(elementID, containerID) {
	var curleft = curtop = 0;
	if ($defined(elementID) && $defined(containerID)) {
		var obj = dojo.byId(elementID);
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
				obj = obj.offsetParent
			} while (obj && obj.id != containerID);
		}
	}
	return [ curleft, curtop ];
}
