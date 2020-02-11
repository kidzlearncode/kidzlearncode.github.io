
vm = InitialzeLuaVirtualMachine();

canvas = document.getElementById( 'characterMovementDisplay' );
renderContext = document.getElementById( 'characterMovementDisplay' ).getContext( '2d' );
renderContext.mozImageSmoothingEnabled = true;  // firefox
renderContext.imageSmoothingEnabled = true;
grid = new Grid( 10, 10 );

shellby = null;
sprites = LoadSprites();


shellbyCommandQue = new Array();

function QueShellbyClockWise() {
    shellbyCommandQue.push( ShellbyClockWise );
}
function QueShellbyCounterClockWise() {
    shellbyCommandQue.push( ShellbyCounterClockWise );
}
function QueShellbyForward() {
    shellbyCommandQue.push( ShellbyForward );
}

function ShellbyX() {
    return grid.ToGridX( shellby.x, canvas );
}

function ShellbyY() {
    return grid.ToGridY( shellby.y, canvas );
}
function ShellbyClockWise() {
    shellby.QueRotation( -Math.PI / 2 );
}

function ShellbyForward() {
    shellby.Forward();
}
ShellbyRight = ShellbyClockWise;

function ShellbyCounterClockWise() {
    shellby.QueRotation( Math.PI / 2 );
}

ShellbyLeft = ShellbyCounterClockWise;

function ShellbyAngle() {
    return shellby.orientation;
}

function AnimationPoint( x, y ) {
    this.x = x;
    this.y = y;
}

function Sprite( sprite, frameWidth, frameHeight )
{
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.sprite = sprite;
    this.cycles = new Array( [ new AnimationPoint( 0, 0 ) ] );
    this.currentFrame = 0;
    this.currentCycle = this.cycles[ 0 ];
    this.scaleFactor = 1;
    this.pause = false;
    this.x = 0.0;
    this.y = 0.0;
    this.orientation = 0.0;
    this.transformQue = new Array();
    this.QueRotation = ( radians ) => {
        this.transformQue.push( radians );
    }
    this.AddAnimationCycle = function( animationPoints ) {
        this.cycles.push( animationPoints );
    }
    this.Pause = function() {
        this.pause = true;
    }
    this.UnPause = function() {
        this.pause = false;
    }
    this.SelectAnimationCycle = function( cycle ) {
        this.currentFrame = 0;
        this.currentCycle = this.cycles[ cycle ];
    }
    this.Forward = function() {
        this.x += Math.cos( this.orientation ) * grid.UnitToPixelX( canvas );
        this.y += Math.sin( this.orientation ) * grid.UnitToPixelY( canvas );
    }
    this.Animate = function ()
    {
        var canvasRatio = canvas.width / canvas.height;
        var rotation = 0.0;
        renderContext.save();
        if( this.transformQue.length > 0 )
            var rotation = this.transformQue.pop();
        var x = ( ( this.frameWidth * this.scaleFactor ) / 2 );
        var y = ( ( this.frameHeight * this.scaleFactor ) / 2 );
        const ROTATION_SCALER = rotation < 0 ? 1 : -1;
        const X_ASPECT_RATIO = ( ( Math.abs( Math.sin( this.orientation + rotation ) ) == 1 ) ? canvasRatio : 1.0 );
        const Y_ASPECT_RATIO = ( ( Math.abs( Math.cos( this.orientation + rotation ) ) == 1 ) ? canvasRatio : 1.0 );        
        renderContext.translate( ( this.x + x ), ( this.y + y ) );
        renderContext.rotate( ( this.orientation += rotation ) + ( Math.PI / 2.0 ) );
        renderContext.translate( -( this.x + x ), -( this.y + y ) );
        renderContext.drawImage( this.sprite, 
                this.currentCycle[ this.currentFrame ].x * this.frameWidth, 
                this.currentCycle[ this.currentFrame ].y * this.frameHeight, 
                this.frameWidth, this.frameHeight, 
                this.x + ( ROTATION_SCALER * ( this.frameWidth / 4 ) * this.scaleFactor * X_ASPECT_RATIO ), 
                this.y + ( ROTATION_SCALER * ( this.frameHeight / 4 ) * this.scaleFactor * Y_ASPECT_RATIO ), 
                this.frameWidth * this.scaleFactor * X_ASPECT_RATIO, this.frameHeight * this.scaleFactor * Y_ASPECT_RATIO );
//        renderContext.scale( X_ASPECT_RATIO, Y_ASPECT_RATIO );
        renderContext.restore();
        if( this.pause == false )
        {
            ++this.currentFrame;
            if( this.currentFrame >= this.currentCycle.length )
                this.currentFrame = 0;
        }
    }
}


function Grid( height, width )
{
    this.height = height;
    this.width = width;

    this.Draw = function( context, canvas ) 
    {
        var canvasRatio = canvas.height / canvas.width;
        var boxWidth = canvas.width / this.width;
        var boxHeight = canvas.height / this.height;
        context.beginPath();
        for( var i = 0; i < this.width; ++i )
        {
            context.moveTo( boxWidth * i, 0 );
            context.lineTo( boxWidth * i, canvas.height );
            context.stroke();
        }
        for( var i = 0; i < this.height; ++i )
        {
            context.moveTo( 0, boxHeight * i );
            context.lineTo( canvas.width, boxHeight * i );
            context.stroke();
        }
    }

    this.ToGridX = function( pixelX, canvas ) {
        return pixelX / ( canvas.width / this.width );
    }
    this.ToGridY = function( pixelY, canvas ) {
        return pixelY / ( canvas.height / this.height );
    }

    this.UnitToPixelX = function( canvas ) {
        return ( canvas.width / this.width );
    }

    this.UnitToPixelY = function( canvas ) {
        return ( canvas.height / this.height );
    }

}

function LoadSprites()
{
    var sprites = new Array();
    var shellbyImage = new Image( 1280, 256 );
    shellbyImage.src = '../ArtAssets/Shellby/ShellbyWalkCycle.png';
    shellby = new Sprite( shellbyImage, 256, 256 );
    shellby.AddAnimationCycle( 
            [ new AnimationPoint( 0, 0 ), 
            new AnimationPoint( 1, 0 ), 
            new AnimationPoint( 2, 0 ), 
            new AnimationPoint( 3, 0 ), 
            new AnimationPoint( 4, 0 ) ] );
    shellby.AddAnimationCycle( [ new AnimationPoint( 0, 0 ) ] );
    shellby.SelectAnimationCycle( 1 );
    shellby.scaleFactor = 1 / 16;
    shellby.x = .5 * ( 1.0 / shellby.scaleFactor );//( shellby.frameWidth / 2 );
    shellby.y = 0;//( shellby.frameHeight / 2 );
    sprites.push( shellby );
    return sprites;
}

starting = 0;

function Render()
{
    renderContext.clearRect( 0, 0, canvas.width, canvas.height );
    if( shellbyCommandQue.length > 0 )
        shellbyCommandQue.shift()();
    for( var i = 0; i < sprites.length; ++i )
        sprites[ i ].Animate();
    grid.Draw( renderContext, canvas );
}
setInterval( Render, 1000 );

function CharacterControlAPI()
{
    return { 
        shellbyAngle: ShellbyAngle,
        shellbyLeft: QueShellbyClockWise, 
        shellbyRight: QueShellbyCounterClockWise,
        shellbyX: ShellbyX,
        shellbyY: ShellbyY, 
        shellbyForward: QueShellbyForward
    };
}

function InitialzeLuaVirtualMachine()
{
    var vm = new shine.VM( CharacterControlAPI() );
    shine.luac.init( vm );
    shine.stdout.write = function ( message ) {
        LuaSTDIO( message );
    };
    return vm;
}

function ResetLuaVirtualMachine( vm )
{
    var shineLib = vm.getGlobal( 'shine' );
    vm._resetGlobals();
    vm.setGlobal( 'shine', shineLib );
}

function LuaSTDIO( message ) {
    console.log( message );
}

function ReportError( error ) {
    console.log( "ERROR IN CODE: " + error );
}

function Compile( code )
{
    callback = function ( error, byteCode )
    {
        if( error )
            ReportError( error );
        else
            vm.load( byteCode );
        editor.focus();
    }
    window.setTimeout( function()
    {
        shine.luac.compile( code, function( error, byteCode ) {
            if( error )
                callback( error.substr( 13 ).split( "\n" )[ 0 ] );
            else
                callback( undefined, byteCode );
        } )
    }, 1 );
}

function RunCode()
{
    ResetLuaVirtualMachine( vm );
    Compile( editor.getValue() );
}
