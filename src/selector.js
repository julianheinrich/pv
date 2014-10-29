(function(exports) {

"use strict";
/**
 * options is optional. It currently handles attributes: highlighting, doubleClickZoom, zoomOnEnter
 */
function Selector(structure, pViewer, geom, options) {
  var that = this;
  this.options = options || {highlighting: 1, doubleClickZoom: 1, zoomOnEnter: 1};
  this.structure = structure;
  this.geom = geom;
  this.pViewer = pViewer;
  this.selectedResidues = [];
  this.existingColors = {};
  this.listeners = [];
  
  if (this.options.highlighting) {
    pViewer.addListener("atomClicked", function (picked, original) {
      that.atomSelected(picked, original);
    });
  }
  
  if (this.options.doubleClickZoom) {
    pViewer.addListener("atomDoubleClicked", function(picked, originalEvent) {
      var transformedPos = vec3.create();
      if (picked === null) {
        pViewer.fitTo(that.structure);
      }
      else {
        var newAtom = picked.object().atom;
        var pos = newAtom.pos();
        if (picked.transform()) {
          vec3.transformMat4(transformedPos, pos, picked.transform());
          pViewer.setCenter(transformedPos, 500);
        } else {
          pViewer.setCenter(pos, 500);
        }
      }
    });
  }
  if (this.options.zoomOnEnter) {
    pViewer.addListener('keypress', function(originalEvent) {
      console.log('keypressed');
      if (originalEvent.keyCode === 13) {
        
        var view = new mol.MolView(that.geom);
        view.addResidues(that.selectedResidues, true);
        pViewer.fitTo(view);
        originalEvent.preventDefault();
      }

    }, true);
  }
}

Selector.prototype.update = function(structure, geom) {
  this.structure = structure;
  this.geom = geom;
  this.selectedResidues = [];
  this.existingColors = {};

};

Selector.prototype.addSelectionListener = function(listener) {
  this.listeners.push(listener);
};

Selector.prototype.fireSelectionChanged = function(view) {
  var that = this;
  this.listeners.forEach(function (listener) {
    listener(that.selectedResidues, that.existingColors, view);
  });
};

Selector.prototype.addResidueSelection = function(selectedResidues) {
  var that = this;
  var view = new mol.MolView(this.geom);
  view.addResidues(selectedResidues, true);
  var changed = false;
  selectedResidues.forEach(function (residue) {
    
    if (typeof that.existingColors[residue.qualifiedName()] === 'undefined') {
      that.selectedResidues.push(residue);
      that.existingColors[residue.qualifiedName()] = rgb.create();
      that.geom.getColorForAtom(residue.atom(0), that.existingColors[residue.qualifiedName()]);
      changed = true;
    }
  });
  that.geom.colorBy(color.uniform('white'), view);
  if (changed) {
    that.fireSelectionChanged(view);
  }

};

var assignColour = function (out, index, colorArray) {
  out[index] = colorArray[0]; 
  out[index+1] = colorArray[1]; 
  out[index+2] = colorArray[2];
  out[index+3] = colorArray[3];
};

Selector.prototype.existingColorScheme = function () {
  var that = this;
  return new ColorOp(function(atom, out, index) {
    var residue = atom.residue();
    
    var color = that.existingColors[residue.qualifiedName()];
    if (color) {
      assignColour(out, index, color);
    }
  }, null, null);

};



Selector.prototype.clearSelection = function(selectedResidues) {
  var that = this;
  var all = false;
  if (typeof selectedResidues === 'undefined') {
    selectedResidues = this.selectedResidues;
    all = true;
  }
  var view = new mol.MolView(this.geom);
  view.addResidues(selectedResidues, true);
  that.geom.colorBy(that.existingColorScheme(), view);
  if (selectedResidues) {
    selectedResidues.forEach(function (residue) {
      delete that.existingColors[residue.qualifiedName()];
      
    });
  }
  if (all) {
    this.selectedResidues = [];
  }
  else {
    this.selectedResidues = this.selectedResidues.filter(function(r) {
      return selectedResidues.indexOf(r) === -1;
    }); 
  }
  that.fireSelectionChanged(view);
};

Selector.prototype.atomSelected = function(picked, originalEvent) {
  if (originalEvent.metaKey || originalEvent.shiftKey) {
    // do not clear selection
  }
  else {
    this.clearSelection();
  }
  if (picked) {
    var newAtom = picked.object().atom;
    var residue = newAtom.residue();
    if (originalEvent.shiftKey && this.lastResiduePicked && this.lastResiduePicked.chain() === residue.chain()) {
      var start = Math.min(this.lastResiduePicked.num(), residue.num());
      var end = Math.max(this.lastResiduePicked.num(), residue.num());
      var residues = residue.chain().residuesInRnumRange(start, end);
      this.addResidueSelection(residues);
    }
    else {
      this.addResidueSelection([residue]);
    }
    this.lastResiduePicked = residue;
    this.pViewer.requestRedraw();
  }
};

exports.Selector = Selector;

})(this);
