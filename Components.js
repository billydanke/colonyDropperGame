function Star(x, y) {
    this.x = x;
    this.y = y;
    this.width = 2;
    this.height = 2;
    this.color = '#f5da42';
  
    this.move = function(amt) {
      this.y += amt;
  
      if(this.y > c.height) {
        this.y = -this.height;
        this.x = Math.floor(Math.random() * c.width);
      }
    }
  
    this.draw = function() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x,this.y,this.width,this.height);
    }
  }
  
  function Sprite(x,y,img,scale,isDrawn=true) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.width = img.width;
    this.height = img.height;
    this.img = img;
    this.isDrawn = isDrawn;
  
    this.draw = function() {
      if(isDrawn) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.img,this.x-(this.width/2),this.y-(this.height/2), this.width*this.scale, this.height*this.scale);
        console.log("draw at (",this.x,",",this.y,") with scale ",this.scale)
      }
    }
  }
  
  function Planet(x,y,img,scale,isDrawn=false) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.width = 16;
    this.height = 16;
    this.img = img;
    this.isDrawn = isDrawn;
    this.inTransition = false;
    this.inOutTransition = false;
    this.description = "";
    this.surfaceScan = "";
    this.moistureScan = "";
    this.atmosphereScan = "";
    this.probeResult = "";
    this.landingSuccess = "";
    this.landingFailure = "";
  
    this.draw = function() {
      if(this.isDrawn) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.img,this.x,this.y, this.width*this.scale, this.height*this.scale);
      }
    }
    this.transition = function(stopLocation) {
      if(this.y < stopLocation) {
        this.y += 2;
      } else {
        this.inTransition = false;
        if(hasArrived) {
          hasArrived = false;
        } else {
          hasArrived = true;
        }
      }
    }
  
    this.reset = function() {
      this.isDrawn = false;
      this.y = -100;
    }
  }