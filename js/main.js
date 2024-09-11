document.addEventListener('DOMContentLoaded', async() => {
    console.log('DOMContentLoaded');

    const millisecondsToDatetimeStr = (milliseconds) => {
        const dateObject = new Date(milliseconds);

        const dateYear=dateObject.getFullYear();
        const dateMonth=(((dateObject.getMonth()+1))<10) ? `0${((dateObject.getMonth()+1))}` : ((dateObject.getMonth()+1));
        const dateDay=((dateObject.getDate())<10) ? `0${(dateObject.getDate())}` : (dateObject.getDate());

        const datetimeHours=(((dateObject.getHours()))<10) ? `0${((dateObject.getHours()))}` : ((dateObject.getHours()));
        const datetimeMinutes=(((dateObject.getMinutes()))<10) ? `0${((dateObject.getMinutes()))}` : ((dateObject.getMinutes()));
        const datetimeSeconds=(((dateObject.getSeconds()))<10) ? `0${((dateObject.getSeconds()))}` : ((dateObject.getSeconds()));

        const datetimeStr=`${dateYear}-${dateMonth}-${dateDay} ${datetimeHours}:${datetimeMinutes}:${datetimeSeconds}`;

        return datetimeStr;
    };

    const byteToKBScale = 0.0009765625;
    const scale = window.devicePixelRatio*2;
    const requiredSize=150;

    const equalAspectRatio=document.querySelector('#equalAspectRatio');

    var _CANVAS, _IMG, imgH=0, imgW=0, _ZOOM_FACTOR=1.0;

    const resizedImgH=document.getElementById('resizedImgH');
    const resizedImgW=document.getElementById('resizedImgW');

    const previewUploadedImage=document.getElementById('previewUploadedImage');
    const saveImageBtn=document.getElementById('saveImageBtn');
    
    const fileName=document.getElementById('fileName');
    const fileSize=document.getElementById('fileSize');
    const imgDimensions=document.getElementById('imgDimensions');
    const fileType=document.getElementById('fileType');
    const lastModified=document.getElementById('lastModified');

    const uploadFile=document.getElementById('uploadFile');
    
    // previewUploadedImage['style']['height'] = `calc(${previewUploadedImage.parentElement.clientHeight}px - 4px - 0.25rem - 0.25rem - 0.8rem - 4px)`;

    saveImageBtn.addEventListener('click', (evt)=> {
        let downloadLink=document.createElement('a');
        downloadLink.href=saveImageBtn.value;

        let fileExt=(fileType.innerText).split('/')[1];
        let saveFileName=fileName.innerText.replace(`.${fileExt}`,'');
        downloadLink.download=`${saveFileName}-${resizedImgW.value}x${resizedImgH.value}.${fileExt}`;
        downloadLink.click();
    });

    function readFileAsDataURL(file) {
        return new Promise((resolve,reject) => {
            let fileredr = new FileReader();
            fileredr.onload = () => resolve(fileredr.result);
            fileredr.onerror = () => reject(fileredr);
            fileredr.readAsDataURL(file);
        });
    }

    function scaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR, imgH, imgW, scale) {
        _CANVAS['style']['width'] = `${imgW}px`;
        _CANVAS['style']['height'] = `${imgH}px`;
        _CANVAS['style']['border'] = '1px dashed #6c757d';
        _CANVAS['style']['margin'] = '0 auto';
        _CANVAS['style']['display'] = 'flex';
        let cWidth=_ZOOM_FACTOR*imgW*scale;
        let cHeight=_ZOOM_FACTOR*imgH*scale;

        _CANVAS.width=cWidth;
        _CANVAS.height=cHeight;

        resizedImgW.value=parseInt(cWidth);
        resizedImgH.value=parseInt(cHeight);

        _CANVAS.getContext('2d').scale(scale, scale);
        _CANVAS.getContext('2d').drawImage(_IMG, 0, 0, imgW*_ZOOM_FACTOR, imgH*_ZOOM_FACTOR);
        saveImageBtn.value=_CANVAS.toDataURL();
    }

    function reverseScaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR, cHeight, cWidth, scale) {
        _CANVAS.width=cWidth;
        _CANVAS.height=cHeight;

        let imgW=parseFloat(cWidth/_ZOOM_FACTOR)/scale;
        let imgH=parseFloat(cHeight/_ZOOM_FACTOR)/scale;

        _CANVAS['style']['width'] = `${imgW}px`;
        _CANVAS['style']['height'] = `${imgH}px`;
        _CANVAS['style']['border'] = '1px dashed #6c757d';
        _CANVAS['style']['margin'] = '0 auto';
        _CANVAS['style']['display'] = 'flex';
        
        _CANVAS.getContext('2d').scale(scale, scale);
        _CANVAS.getContext('2d').drawImage(_IMG, 0, 0, imgW*_ZOOM_FACTOR, imgH*_ZOOM_FACTOR);

        saveImageBtn.value=_CANVAS.toDataURL();
    }

    resizedImgW.addEventListener('change', (evtW)=> {
        let cWidth=evtW.target.valueAsNumber;
        let cHeight=resizedImgH.valueAsNumber;
        if(equalAspectRatio.checked) {
            cHeight=parseFloat(cWidth/_CANVAS.width)*_CANVAS.height;
            resizedImgH.value=Math.round(cHeight);
        }
        reverseScaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR, cHeight, cWidth, scale);
    });
    resizedImgH.addEventListener('change', (evtH)=> {
        let cHeight=evtH.target.valueAsNumber;
        let cWidth=resizedImgW.valueAsNumber;
        if(equalAspectRatio.checked) {
            cWidth=parseFloat(cHeight/_CANVAS.height)*_CANVAS.width;
            resizedImgW.value=Math.round(cWidth);
        }
        reverseScaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR, cHeight, cWidth, scale);
    });

    equalAspectRatio.addEventListener('click', async(evt)=> {
        if(equalAspectRatio.checked) {
            let cWidth=resizedImgW.valueAsNumber;
            let cHeight=parseFloat(cWidth/_IMG.naturalWidth)*_IMG.naturalHeight;
            resizedImgH.value=Math.round(cHeight);
            reverseScaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR, cHeight, cWidth, scale);
        }
    });

    const loadImage = (url) => new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.src = url;
    });
    
    // IE8
    // IE9+ and other modern browsers
    function triggerEvent(el, type) {
        let e = (('createEvent' in document) ? document.createEvent('HTMLEvents') : document.createEventObject());
        if ('createEvent' in document) {
            e.initEvent(type, false, true);
            el.dispatchEvent(e);
        } else {
            e.eventType = type;
            el.fireEvent('on' + e.eventType, e);
        }
    }

    uploadFile.addEventListener('click', (evt)=> {
        evt.currentTarget.value='';
    });
    uploadFile.addEventListener('change', async(evt) => {
        let file = evt.currentTarget.files[0];
        if(!file) return;

        fileName.innerHTML=file.name;
        fileSize.innerHTML=`${(parseFloat(file.size) * byteToKBScale).toFixed(2)} 𝙺𝙱`;
        fileType.innerHTML=file.type;
        lastModified.innerHTML=millisecondsToDatetimeStr(file.lastModified);

        let b64str = await readFileAsDataURL(file);
        _IMG = await loadImage(b64str);
        const previewThumbnail = _IMG;

        // set sizes in memory
        imgH=_IMG.naturalHeight;
        imgW=_IMG.naturalWidth;
        imgDimensions.innerHTML=`${imgW}px × ${imgH}px`;

        _IMG['style']['height']=`${imgH}px`;
        _IMG['style']['width']=`${imgW}px`;

        _CANVAS=document.createElement('canvas');
        scaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR,imgH, imgW, scale);
        previewUploadedImage.appendChild(previewThumbnail);

        // display size
        const sizeBenchmark = Math.min(imgW, imgH);
        _ZOOM_FACTOR=requiredSize/parseFloat(sizeBenchmark);

        let displayedHeight=Math.round(_ZOOM_FACTOR*imgH);
        let displayedWidth=Math.round(_ZOOM_FACTOR*imgW);

        previewThumbnail['style']['height']=`${displayedHeight}px`;
        previewThumbnail['style']['width']=`${displayedWidth}px`;

        _IMG['style']['height']=`${displayedHeight}px`;
        _IMG['style']['width']=`${displayedWidth}px`;
        scaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR, displayedHeight, displayedWidth, scale);

        resizedImgW.value = imgW;
        triggerEvent(resizedImgW, 'change');
    });
});