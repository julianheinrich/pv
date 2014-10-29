Rendered Molecules
=========================================================================================

A :class:Selector handles typical selection functionality for a molecular viewer.  

  The Selector can be initialized as following:
.. code-block:: javascript
  
  this.selector = new Selector(structure, viewer, geom);
  this.selector.addSelectionListener(function (residues, residueMap, selectionChangeView) {
    console.log('The selection has changed, here is the current selection: ' + residues.map(function (residue) { return residue.qualifiedName()}));
  });

.. function:: Selector(structure, viewer, geom, [options])

  Call the Constructor after the viewer and geom has been initialized. 

  :param structure: the MolView representing the whole structure
  :param viewer: the PV viewer object
  :param geom: the geometry returned from the viewers render function
  :param options: optional. If not included it will add ALL options. The options can include {highlighting: 1, doubleClickZoom: 1, zoomOnEnter: 1}
    :highlighting: add to show residue highlighting when selected. Multiple select with the meta key (Command on Mac, Ctrl on windows). Range select with shift.
    :doubleClickZoom: allow double clicking a residue to auto-zoom to that residue location. Double click background to view the whole structure.
    :zoomOnEnter: allows pressing the enter key to zoom to the current selection. The Canvas needs to have focus to accept the key event. The Canvas gets focus on a mousedown event.
      Technically the canvas doesn't get focus but its parent dom does programatically. 
  :return: the name of the symmetry related copy shown.

.. function:: Selector.addSelectionListener(listener)

  add a listener for events when the selection changes. 
  

  :param listener: The listener callback accepts 3 parameters: listener(selectedResidues, existingColors, view). The selectedResidues is an array, the existingColors is an object keyed by the qualified residue name and the value is its original color. The view is a view representing the change in selection.

.. function:: Selector.addResidueSelection(selectedResidues)

  add an array of residues to the current selection.
  
  :param selectedResidues: an array of residues to add to the selection.

.. function:: Selector.clearSelection([selectedResidues])

  clear the selection
  
  :param selectedResidues: add an array of residues to clear from the current selection. If undefined, then clear all of the selection.


.. function:: Selector.update(structure, geom) 

  Update the Selector with a new structure and geom.
  
  :param structure: the new structure for selection
  :param geom: the new geom for selection 

