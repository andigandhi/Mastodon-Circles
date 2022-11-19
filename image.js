const toRad = (x) => x * (Math.PI / 180);

const dist = [200, 330, 450];
const numb = [8, 15, 26];
const radius = [64,58,50];
let userNum = 0;

function render(users) {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
    
    const width = canvas.width;
	const height = canvas.height;

	// fill the background
	ctx.fillStyle = "#282c37";
	ctx.fillRect(0, 0, width, height);

    loadImage(ctx, ownProfilePic, (width/2)-110, (height/2)-110, 110, 110);

	// loop over the layers
	for (var layerIndex=0; layerIndex<3; layerIndex++) {
        //let layerIndex = get_layer(num);

		const angleSize = 360 / numb[layerIndex];

		// loop over each circle of the layer
		for (let i = 0; i < numb[layerIndex]; i++) {
			// We need an offset or the first circle will always on the same line and it looks weird
			// Try removing this to see what happens
			const offset = layerIndex * 30;

			// i * angleSize is the angle at which our circle goes
			// We need to converting to radiant to work with the cos/sin
			const r = toRad(i * angleSize + offset);

			const centerX = Math.cos(r) * dist[layerIndex] + width / 2;
			const centerY = Math.sin(r) * dist[layerIndex] + height / 2;

            loadImage(
                ctx,
                users[userNum][1]["pic"],
				centerX - radius[layerIndex],
				centerY - radius[layerIndex],
				radius[layerIndex],
				radius[layerIndex]
			);

            userNum++;
			// if we are trying to render a circle but we ran out of users, just exit the loop. We are done.
			if (userNum>=users.length) break;
		}
	}

	ctx.fillStyle = "#DDDDDD";
    ctx.fillText("@sonnenbrandi@mieke.club mit lieben Grüßen an Duiker101", 700, 985, 290)
};

function get_layer(i) {
    if (i<numb[0]) return 0;
    if (i<numb[0]+numb[1]) return 1;
    return 2;   
}

// Load the image from the URL and draw it in a circle
function loadImage(ctx, url, x, y, r) {
    var img = new Image;
    img.onload = function(){
        ctx.save();
        ctx.beginPath();
        ctx.arc(x+r, y+r, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img,x,y,r*2,r*2);

        ctx.beginPath();
        ctx.arc(x+r, y+r, r, 0, Math.PI * 2, true);
        ctx.clip();
        ctx.closePath();
        ctx.restore();
    };
    img.src = url;
}