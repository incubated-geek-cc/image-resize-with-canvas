if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
    callback();
} else {
    document.addEventListener('DOMContentLoaded', async() => {
        console.log('DOMContentLoaded');

        const yearDisplay=document.getElementById('yearDisplay');
        yearDisplay.innerHTML=new Date().getFullYear();

        const byteToKBScale = 0.0009765625;
        // window.devicePixelRatio = 3.0;
        const scale = window.devicePixelRatio*2;
        const requiredSize=350;

        var _CANVAS, _IMG, imgH=0, imgW=0, _ZOOM_FACTOR=1.0;

        var resizedImgH=document.getElementById('resizedImgH');
        var resizedImgW=document.getElementById('resizedImgW');

        var previewUploadedImage=document.getElementById('previewUploadedImage');
        var saveImageBtn=document.getElementById('saveImageBtn');
        
        var fileName=document.getElementById('fileName');
        var fileSize=document.getElementById('fileSize');
        var imgDimensions=document.getElementById('imgDimensions');
        var fileType=document.getElementById('fileType');
        var lastModified=document.getElementById('lastModified');

        var uploadFileBtn=document.getElementById('uploadFileBtn');
        var uploadFile=document.getElementById('uploadFile');

        uploadFileBtn.addEventListener('click', ()=> {
            let clickEvent = new MouseEvent('click', { view: window, bubbles: false, cancelable: false });
            uploadFile.dispatchEvent(clickEvent);
        }, false);

        saveImageBtn.addEventListener('click', (evt)=> {
            let downloadLink=document.createElement('a');
            downloadLink.href=saveImageBtn.value;

            let fileExt=(fileType.innerText).split('/')[1];
            let saveFileName=fileName.innerText.replace(`.${fileExt}`,'');
            downloadLink.download=`${saveFileName}-${resizedImgW.value}x${resizedImgH.value}.${fileExt}`;
            downloadLink.click();
        }, false);

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
            let cHeight=parseFloat(cWidth/_CANVAS.width)*_CANVAS.height;

            resizedImgH.value=parseInt(cHeight);
            reverseScaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR, cHeight, cWidth, scale);
        }, false);
        resizedImgH.addEventListener('change', (evtH)=> {
            let cHeight=evtH.target.valueAsNumber;
            let cWidth=parseFloat(cHeight/_CANVAS.height)*_CANVAS.width;

            resizedImgW.value=parseInt(cWidth);
            reverseScaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR, cHeight, cWidth, scale);
        }, false);

        const loadImage = (url) => new Promise((resolve, reject) => {
          const img = new Image();
          img.addEventListener('load', () => resolve(img));
          img.addEventListener('error', (err) => reject(err));
          img.src = url;
        });

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

        uploadFile.addEventListener('change', async (evt) => {
            let file = evt.currentTarget.files[0];
            if(!file) return;

            fileName.innerHTML=file.name;
            fileSize.innerHTML=`${(parseFloat(file.size) * byteToKBScale).toFixed(2)} 🇰🇧`;
            fileType.innerHTML=file.type;
            lastModified.innerHTML=millisecondsToDatetimeStr(file.lastModified);

            let b64str = await readFileAsDataURL(file);
            _IMG = await loadImage(b64str);

            // set sizes in memory
            imgH=_IMG.naturalHeight;
            imgW=_IMG.naturalWidth;
            imgDimensions.innerHTML=`${imgW}px × ${imgH}px`;

            _IMG['style']['height']=`${imgH}px`;
            _IMG['style']['width']=`${imgW}px`;

            _CANVAS=document.createElement('canvas');
            scaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR,imgH, imgW, scale);
            previewUploadedImage.appendChild(_CANVAS);

            // display size
            const sizeBenchmark = Math.min(imgW, imgH);
            _ZOOM_FACTOR=requiredSize/parseFloat(sizeBenchmark);

            let displayedHeight=parseInt(_ZOOM_FACTOR*imgH);
            let displayedWidth=parseInt(_ZOOM_FACTOR*imgW);
            _IMG['style']['height']=`${displayedHeight}px`;
            _IMG['style']['width']=`${displayedWidth}px`;

            scaleCanvas(_CANVAS, _IMG, _ZOOM_FACTOR,displayedHeight, displayedWidth, scale);
        }, false);
    });
}