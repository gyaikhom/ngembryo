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

/**
 * Create a confirmation dialog in Dojo.
 * 
 * (Reference: http://www.jeviathon.com/2009/08/dojo-confirmation-dialog.html)
 * 
 * @param title
 * @param question
 * @param callback
 * @param event
 * @return
 */
function confirmDialog(title, question, callbackFn, onHideFn, e) {
	if (!e)
		var e = window.event;
	e.cancelBubble = true;
	if (e.stopPropagation) {
		e.stopPropagation();
		e.preventDefault();
	}
	
	var errorDialog = dijit.byId("confirmationDialog");
	if ($defined(errorDialog)) {
		dojo.body().removeChild(errorDialog.domNode);
		errorDialog.destroyRecursive(false);
	}

	errorDialog = new dijit.Dialog( {
		id : 'confirmationDialog',
		title : title,
		onHide : onHideFn
	});
	
	var callback = function(mouseEvent) {
		errorDialog.hide();
		if (window.event)
			event = window.event;
		var srcEl = mouseEvent.srcElement ? mouseEvent.srcElement
				: mouseEvent.target; // IE or Firefox
		if (srcEl.id == 'yes') {
			callbackFn(true);
		} else {
			callbackFn(false);
		}
	};
	var questionDiv = dojo.create('div', {
		innerHTML : question
	});
	var yesButton = new dijit.form.Button( {
		label : 'Yes',
		id : 'yes',
		onClick : callback
	});
	var noButton = new dijit.form.Button( {
		label : 'No',
		id : 'no',
		onClick : callback
	});

	errorDialog.containerNode.appendChild(questionDiv);
	errorDialog.containerNode.appendChild(yesButton.domNode);
	errorDialog.containerNode.appendChild(noButton.domNode);
	dojo.body().appendChild(errorDialog.domNode);
	errorDialog.startup();
	errorDialog.show();
}
