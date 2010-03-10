/**
 * @projectDescription The Next-Generation Embryology Project
 *
 * School of Informatics, University of Edinburgh Funded by the JISC
 * (http://www.jisc.ac.uk/)
 *
 * @author gyaikhom
 * @version 0.0.1
 */

function destroyChildSubtree(node) {
	if (node.hasChildNodes()) {
		while (node.childNodes.length >= 1) {
			destroyChildSubtree(node.firstChild);
			node.removeChild(node.firstChild);
		}
	}
}
