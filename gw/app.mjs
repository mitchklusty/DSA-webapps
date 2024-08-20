import { RotationControlOverlay } from 'https://cdn.jsdelivr.net/gh/pearcetm/osd-paperjs-annotation@0.4.12/src/js/rotationcontrol.mjs';

import { DSAUserInterface } from '/DSA-webapps/dsa/dsauserinterface.mjs';
import { SegmentationUI } from '/DSA-webapps/apps/segmentationui.mjs';
import { DSA_INSTANCE_URL } from '/DSA-webapps/config.mjs';

// create the viewer
let viewer = window.viewer = OpenSeadragon({
    element:'viewer',
    prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
    minZoomImageRatio:0.01,
    maxZoomPixelRatio:16,
    visibilityRatio:0,
    crossOriginPolicy: 'Anonymous',
    ajaxWithCredentials: false,
    showNavigator:true,
    sequenceMode:true,
});


var hash = window.location.hash.substr(1);

var hashParams = hash.split('&').reduce(function (res, item) {
    var parts = item.split('=');
    res[parts[0]] = parts[1];
    return res;
}, {});

if ("image" in hashParams){
    localStorage.setItem('image', hashParams["image"]);
}



const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const girderToken = params.get('girderToken');
if (girderToken) {
    params.delete('girderToken');
    var newUrl = window.location.origin + window.location.pathname 
    if (params.length > 0){
        newUrl += '?' + params.toString();
    }
    if (DSA_INSTANCE_URL){
        newUrl += "#dsa="+DSA_INSTANCE_URL;
        var imageQueryParam = localStorage.getItem('image') || false;
        if (imageQueryParam){
            newUrl += `&image=${imageQueryParam}`;
        }
    }
    console.log("NewURL: ", newUrl);
    window.history.replaceState({}, document.title, newUrl);
    window.location.href = newUrl;
} 


// DSA setup
const dsaUI = new DSAUserInterface(viewer,{showHeader:'hash'});

// window.dsa = dsaUI;
if (girderToken && dsaUI !== null){
    dsaUI.API.settoken(girderToken);
}


// console.log(dsaUI.API.LoginSystem);.
// M UNCOMMENT
// dsaUI.header.appendTo('.dsa-ui-container');


// console.log("Connect to dsa")
// dsaUI.connectToDSA(DSA_INSTANCE_URL);

// Add rotation control
const rotationControl = new RotationControlOverlay(viewer);
rotationControl.origActivate = rotationControl.activate;
rotationControl.disable = () => rotationControl.activate = ()=>{};
rotationControl.enable = () => rotationControl.activate = rotationControl.origActivate;

const ANNOTATION_NAME = 'Gray White Segmentation';
const ANNOTATION_DESCRIPTION = 'Created by the Gray-White Segmentation Web App';

const options = {
    name: ANNOTATION_NAME,
    description: ANNOTATION_DESCRIPTION,
    dsa: dsaUI,
    viewer:viewer,
    regions:[
        {
            name:'Gray Matter',
            color:'green'
        },
        {
            name:'White Matter',
            color:'blue'
        },
        {
            name:'Superficial',
            color:'yellow'
        },
        {
            name:'Leptomeninges',
            color:'black'
        },
        {
            name:'Other',
            color:'magenta'
        },
        {
            name:'Background',
            color:'gray'
        },
        {
            name:'Exclude',
            color:'red'
        },
    ]
}
const segmentationUI = new SegmentationUI(options);
segmentationUI.dsaContainer.appendChild(dsaUI.header[0]);
segmentationUI.setSaveHandler((itemID, geoJSON)=>{

    return dsaUI.saveAnnotationInDSAFormat(itemID, geoJSON, true).then(d=>{
        segmentationUI.setAnnotationId(d._id);
        window.alert('Save succeeded');
    }).catch(e=>{
        console.warning('Problem saving annotation:')
        console.log(e);
        window.alert('There was a problem saving the annotaiton. See console for details.');
    });
})