Engine.misc = {
    loadCollisionMask(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imageUrl;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                const mask = {};

                for (let y = 0; y < canvas.height; y++) {
                    const row = [];

                    let start = -1;

                    for (let x = 0; x < canvas.width; x++) {
                        const index = (y * canvas.width + x) * 4;
                        const alpha = data[index + 3];
    
                        const full = alpha > 0 ? true : false;

                        if(full && start === -1){
                            start = x
                        } else if (!full && start > 0){
                            row.push([start, x])
                            start = -1
                        }
                    }

                    if(row.length > 0) mask[y] = row
                }
                
                resolve(mask)
            };
    
            img.onerror = (error) => {
                reject(error);
            };
        });
    }
}