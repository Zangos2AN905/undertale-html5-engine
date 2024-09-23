if(!window.Engine) window.Engine = {};

Engine.misc = {
    createCollisionMask(imageUrl) {
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

                        if(x === canvas.width - 1 && full){
                            row.push([start, x])
                            start = -1
                            break
                        }
                        
                        if(full && start === -1){
                            start = x
                        } else if (!full && start !== -1){
                            row.push([start, x])
                            start = -1
                        }
                        // console.log(full);
                    }

                    if(start > 0){
                        row.push([start, canvas.width - 1])
                    }

                    if(row.length > 0) mask[y] = row
                }
                
                resolve(mask)
            };
    
            img.onerror = (error) => {
                reject(error);
            };
        });
    },

    // NOTE: The decoding function is included as a standard method of the Engine class
    // Encoding functions are separated because they shuold not be done from the engine directly.

    encodeCollisionMasks(masks) {
        const buffer = [];
    
        // Add the number of masks (1 byte)
        buffer.push(Object.keys(masks).length);
    
        const maskBuffers = [];
    
        // Iterate over each mask
        for (const [maskID, collisionMask] of Object.entries(masks)) {
            // Create a buffer for this mask's collision data
            const encodedMask = Engine.misc.encodeCollisionMask(collisionMask);
            maskBuffers.push({ id: parseInt(maskID), data: encodedMask });
    
            // Add Mask ID (2 bytes)
            buffer.push(maskID & 0xFF, (maskID >> 8) & 0xFF);
    
            // Add Mask Size (4 bytes)
            const size = encodedMask.length;
            buffer.push(size & 0xFF, (size >> 8) & 0xFF, (size >> 16) & 0xFF, (size >> 24) & 0xFF);
        }
    
        // Add each mask's data to the buffer
        for (const mask of maskBuffers) {
            buffer.push(...mask.data);
        }
    
        // Convert to a Uint8Array for binary storage
        return new Uint8Array(buffer);
    },

    encodeCollisionMask(collisionMask) {
        const buffer = [];
        
        // Iterate over the Y-coordinates in the collision mask
        for (const y in collisionMask) {
            const ranges = collisionMask[y];
            const yCoord = parseInt(y);
    
            // Add the Y-coordinate (2 bytes)
            buffer.push(yCoord & 0xFF, (yCoord >> 8) & 0xFF);
    
            // Add the number of ranges (1 byte)
            buffer.push(ranges.length);
    
            // Add each range as two Uint16 values (start and end)
            for (const [start, end] of ranges) {
                buffer.push(start & 0xFF, (start >> 8) & 0xFF);
                buffer.push(end & 0xFF, (end >> 8) & 0xFF);
            }
        }
    
        // Convert buffer to a Uint8Array for compact binary storage
        return new Uint8Array(buffer);
    }
}