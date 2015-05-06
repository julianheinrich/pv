
requirejs.config({
  'baseUrl' : 'src' ,
  // uncomment the following commented-out block to test the contatenated, 
  // minified PV version. Grunt needs to be run before for this to work.
  /*
  paths : {
    pv : '/js/pv.min'
  }
  */
});


// on purpose outside of the require block, so we can inspect the viewer object 
// from the JavaScript console.
var viewer;

var pv;
require(['pv'], function(PV) {

pv = PV;
var io = pv.io;
var viewpoint = pv.viewpoint;
var color = pv.color;

var structure;

function lines() {
  viewer.clear();
  viewer.lines('structure', structure, {
              color: color.byResidueProp('num'),
              showRelated : '1' });
}

function cartoon() {
  viewer.clear();
  var go = viewer.cartoon('structure', structure, {
      color : color.ssSuccession(), showRelated : '1',
  });
  var rotation = viewpoint.principalAxes(go);
  viewer.setRotation(rotation)
}

function lineTrace() {
  viewer.clear();
  viewer.lineTrace('structure', structure, { showRelated : '1' });
}

function spheres() {
  viewer.clear();
  viewer.spheres('structure', structure, { showRelated : '1' });
}

function surface() {
  viewer.clear();
  viewer.surface('structure', structure, { showRelated : '1' });
}

function sline() {
  viewer.clear();
  viewer.sline('structure', structure,
          { color : color.uniform('red'), showRelated : '1'});
}

function tube() {
  viewer.clear();
  viewer.tube('structure', structure);
  viewer.lines('structure.ca', structure.select({aname :'CA'}),
            { color: color.uniform('blue'), lineWidth : 1,
              showRelated : '1' });
}

function trace() {
  viewer.clear();
  viewer.trace('structure', structure, { showRelated : '1' });
}
function ballsAndSticks() {
  viewer.clear();
  viewer.ballsAndSticks('structure', structure, { showRelated : '1' });
}

function preset() {
  viewer.clear();
  var ligand = structure.select({'rnames' : ['SAH', 'RVP']});
  viewer.ballsAndSticks('structure.ligand', ligand, {
  });
  viewer.cartoon('structure.protein', structure, { boundingSpheres: false });
}

function load(pdb_id) {
  $.ajax({ url : 'pdbs/'+pdb_id+'.pdb', success : function(data) {
    structure = io.pdb(data);
    //mol.assignHelixSheet(structure);
    cartoon();
    viewer.autoZoom();
  }});
}
function kinase() {
  load('1ake');
}

function crambin() {
  load('1crn');
}

function transferase() {
  load('1r6a');
}

function telethonin() { load('2f8v'); }

function porin() {
  load('2por');
}
function longHelices() {
  load('4C46');
}

function ssSuccession() {
  viewer.forEach(function(go) {
    go.colorBy(color.ssSuccession());
  });
  viewer.requestRedraw();
}

function uniform() {
  viewer.forEach(function(go) {
    go.colorBy(color.uniform([0,1,0]));
  });
  viewer.requestRedraw();
}
function byElement() {
  viewer.forEach(function(go) {
    go.colorBy(color.byElement());
  });
  viewer.requestRedraw();
}

function ss() {
  viewer.forEach(function(go) {
    go.colorBy(color.bySS());
  });
  viewer.requestRedraw();
}

function proInRed() {
  viewer.forEach(function(go) {
    go.colorBy(color.uniform('red'), go.select({rname : 'PRO'}));
  });
  viewer.requestRedraw();
}
function rainbow() {
  viewer.forEach(function(go) {
    go.colorBy(color.rainbow());
  });
  viewer.requestRedraw();
}

function byChain() {
  viewer.forEach(function(go) {
    go.colorBy(color.byChain());
  });
  viewer.requestRedraw();
}

function polymerase() {
  load('4UBB');
};

function computeEntropy() {
  var rotation = viewer.getCamera().rotation();
  var npix = {};
  var that = this;
  
  viewer.eachVisibleObject(rotation, function(obj) {
    if (typeof(npix[obj.atom.residue().num()]) === 'undefined') {
      npix[obj.atom.residue().num()] = 1;
    } else {
      npix[obj.atom.residue().num()] += 1;
    }
    
  });

  var e = entropy(npix);
  
  return e;

}

function entropy(npix) {
  var size = viewer._pickBuffer.width() * viewer._pickBuffer.height();
  if (size <= 0) return null;
  var e = 0;
  for (var index in npix) {
          if (npix.hasOwnProperty(index)) {
                  var tmp = npix[index]/size;    // > 0 by construction
//                var w = this.featureWeights[index];
                  var contrib = tmp * Math.log(tmp) / Math.log(2);
                  e += contrib;
          } 
  }
//console.log("entropy: " + -e);
  return -e;
}

$(document).foundation();
$('#1r6a').click(transferase);
$('#1crn').click(crambin);
$('#1ake').click(kinase);
$('#4ubb').click(polymerase);
$('#4c46').click(longHelices);
$('#2f8v').click(telethonin);
$('#style-cartoon').click(cartoon);
$('#style-tube').click(tube);
$('#style-line-trace').click(lineTrace);
$('#style-sline').click(sline);
$('#style-trace').click(trace);
$('#style-lines').click(lines);
$('#style-balls-and-sticks').click(ballsAndSticks);
$('#style-spheres').click(spheres);
$('#color-uniform').click(uniform);
$('#color-element').click(byElement);
$('#color-chain').click(byChain);
$('#color-ss-succ').click(ssSuccession);
$('#color-ss').click(ss);
$('#color-rainbow').click(rainbow);
$('#load-from-pdb').change(function() {
  var pdbId = this.value;
  this.value = '';
  this.blur();
  $.ajax('http://www.rcsb.org/pdb/files/'+pdbId+'.pdb')
    .done(function(data) {
      structure = io.pdb(data);
      cartoon();
      viewer.autoZoom();
    })
});
$('#view-entropy').click(function() {
  console.log("Entropy: " + computeEntropy());
});
$('#view-pca').click(cartoon);
$('#view-autoZoom').click(function() {
//  viewer.clear();
//  var cm = viewer.customMesh('boundingSphere');
//  var bs = structure.boundingSphere();
//  cm.addSphere(bs.center(), bs.radius());
//  cartoon();
  viewer.autoZoom();
});
viewer = pv.Viewer(document.getElementById('viewer'), { 
    width : 'auto', height: 'auto', antialias : true, 
    outline : true, quality : 'medium',
    background : '#333', animateTime: 500,
});
viewer.addListener('viewerReady', longHelices);
window.addEventListener('resize', function() {
      viewer.fitParent();
});

});