
vm = InitialzeLuaVirtualMachine();

canvas = document.getElementById( 'characterMovementDisplay' );
renderContext = document.getElementById( 'characterMovementDisplay' ).getContext( '2d' );
speedSlider = document.getElementById( 'shellbySpeedSlider' );
goalBox = document.getElementById( 'currentGoalBox' );
renderContext.mozImageSmoothingEnabled = true;  //firefox
renderContext.imageSmoothingEnabled = true;
grid = new Grid( 10, 10 );
var lastFrameRate = speedSlider.value;

reset = false;

currentLevel = 0;
currentRunningCode = "";
shellby = null;
leafImage = null;
SHELLBY_DEFAULT_X = 500;
SHELLBY_DEFAULT_Y = 300;
sprites = LoadSprites();
shellbyCommandQue = new Array();
shellbyCommandQueCompanion = new Array();

function MakeLevels()
{
    return [ 
        new Level( "Turn Right", function( level )
        {
            var result = 0;
            shellbyCommandQueCompanion.forEach( element => {
                if( element == 'ShellbyClockWise' )
                    result = 1;
            } );
            return result;
        }, 'Make Shellby turn right, or "clockwise"' ), 
        new Level( "Turn Left", function( level )
        { 
            var result = 0;
            shellbyCommandQueCompanion.forEach( element => {
                if( element == 'ShellbyCounterClockWise' )
                    result = 1;
            } );
            return result;
        }, 'Make Shellby turn left, or "counter - clockwise"' ),
        new Level( "Go Forward!", function( level )
        {
            var result = 0;
            shellbyCommandQueCompanion.forEach( element => {
                if( element == 'ShellbyForward' )
                    result = 1;
            } );
            return result;
        }, 'Make Shellby go forward' ), 
        new Level( "Go Backward", function( level )
        { 
            var result = 0;
            shellbyCommandQueCompanion.forEach( element => {
                if( element == 'ShellbyBackward' )
                    result = 1;
            } );
            return result;
        }, 'Make Shellby go backward' ), 
        new Level( "Lets Eat The Leaf", function( level )
        { 
            var result = 0;
            shellbyCommandQueCompanion.forEach( element => {
                if( element == 'EatLeaf' )
                    result = 1;
            } );
            return result;
        }, 'Awesome, Shellby is hungry after all that work, try to help her by telling her how to get her faviorite snack!', 
        function( level ) {
            level.PushLeaf( 200, 200 );
        } ), 
        new Level( "Cruncy Square", function( level )
        { 
            var result = 0;
            shellbyCommandQueCompanion.forEach( element => 
            {
                if( element == 'EatLeaf' )
                    ++level.leafEatCount;
                if( element == 'ShellbyClockWise' )
                    ++level.clockwiseCount;
                if( element == 'ShellbyCounterClockWise' )
                    ++level.counterClockwiseCount;
                } );
                if( level.leafEatCount >= 3 && 
                        ( ( level.clockwiseCount == 3 ) != 
                        ( level.counterClockwiseCount == 3 ) ) )
                    result = 1;
                return result;
            },
        'Make Shellby do a loop with EITHER three clockwise/right turns or three counter - clockwise/left turns and eat all the leaves.', 
        function( level )
        {
            console.log( "Initialize Level!" );
            level.__proto__.leafEatCount = 0;
            level.__proto__.clockwiseCount = 0;
            level.__proto__.counterClockwiseCount = 0;
            level.PushLeaf( 200, 300 );
            level.PushLeaf( 700, 300 );
            level.PushLeaf( 700, 800 );
            level.PushLeaf( 200, 800 );
        } )
    ];
}

levels = MakeLevels();


function QueShellbyClockWise() {
    shellbyCommandQueCompanion.push( 'ShellbyClockWise' );
    shellbyCommandQue.push( ShellbyClockWise );
}
function QueShellbyCounterClockWise() {
    shellbyCommandQueCompanion.push( 'ShellbyCounterClockWise' );
    shellbyCommandQue.push( ShellbyCounterClockWise );
}
function QueShellbyForward() {
    shellbyCommandQueCompanion.push( 'ShellbyForward' );
    shellbyCommandQue.push( ShellbyForward );
}

function QueShellbyBackward() {
    shellbyCommandQueCompanion.push( 'ShellbyBackward' );
    shellbyCommandQue.push( ShellbyBackward );
}

function ShellbyX() {
    return grid.ToGridX( shellby.x, canvas );
}

function ShellbyY() {
    return grid.ToGridY( shellby.y, canvas );
}
function ShellbyClockWise() {
    shellby.RotateClockwise();
}

function ShellbyCounterClockWise() {
    shellby.RotateCounterClockwise();
}

ShellbyLeft = QueShellbyCounterClockWise;
ShellbyRight = QueShellbyClockWise;

function ShellbyForward() {
    shellby.Forward();
}

function ShellbyBackward() {
    shellby.Backward();
}

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
    this.QueRotation = ( radians, x, y ) => {
        this.transformQue.push( [ radians, x, y ] );
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
    this.Backward = function() {
        this.x -= Math.cos( this.orientation ) * grid.UnitToPixelX( canvas );
        this.y -= Math.sin( this.orientation ) * grid.UnitToPixelY( canvas );
    }
    this.RotateClockwise = function()
    {
        const THETA = Math.PI / 2;
        this.QueRotation( THETA, 
                grid.UnitToPixelX( canvas ) * ( Math.cos( this.orientation + THETA ) + grid.ToGridX( this.x, canvas ) ), 
                grid.UnitToPixelY( canvas ) * ( Math.sin( this.orientation + THETA ) + grid.ToGridY( this.y, canvas ) ) );
    }
    this.RotateCounterClockwise = function()
    {
        const THETA = 3 * Math.PI / 2;
        this.QueRotation( THETA, 
                grid.UnitToPixelX( canvas ) * ( grid.ToGridX( this.x, canvas ) - Math.cos( this.orientation ) ), 
                grid.UnitToPixelY( canvas ) * ( grid.ToGridY( this.y, canvas ) - Math.sin( this.orientation ) ) );
    }
    this.Animate = function ()
    {
        const ASPECT_RATIO = canvas.width / canvas.height;
        renderContext.save();
        while( this.transformQue.length > 0 )
        {
            var transform = this.transformQue.pop();
            this.orientation += transform[ 0 ];
            this.x = transform[ 1 ];
            this.y = transform[ 2 ];
        }
        renderContext.translate( ( this.x ), ( this.y ) );
        renderContext.rotate( ( this.orientation ) + ( Math.PI / 2.0 ) );
        renderContext.translate( -( this.x ), -( this.y ));
        const DISPLAY_WIDTH = ( this.frameWidth * this.scaleFactor * Math.abs( Math.cos( this.orientation ) ) );
        const DISPLAY_HEIGHT = ( this.frameHeight * this.scaleFactor * Math.abs( Math.sin( this.orientation ) ) );
        renderContext.drawImage( this.sprite, 
                this.currentCycle[ this.currentFrame ].x * this.frameWidth, 
                this.currentCycle[ this.currentFrame ].y * this.frameHeight, 
                this.frameWidth, this.frameHeight, this.x, this.y, 
                ( DISPLAY_WIDTH + DISPLAY_HEIGHT ) * ASPECT_RATIO, 
                ( DISPLAY_HEIGHT + DISPLAY_WIDTH ) * ( 1 / ASPECT_RATIO ) );
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
        return Math.round( pixelX / ( canvas.width / this.width ) );
    }
    this.ToGridY = function( pixelY, canvas ) {
        return Math.round( pixelY / ( canvas.height / this.height ) );
    }

    this.UnitToPixelX = function( canvas ) {
        return Math.round( canvas.width / this.width );
    }

    this.UnitToPixelY = function( canvas ) {
        return Math.round( canvas.height / this.height );
    }

}

function LevelObject( image, x, y, level, active = false, initialize = null, update = null, destroy = null )
{
    this.active = active;
    this.image = image;
    this.sprite = new Sprite( image, image.width, image.height );
    this.sprite.x = x;
    this.sprite.y = y;
    this.initialized = false;
    this.initialize = initialize;
    this.level = level;
    this.destroyed = false;
    this.Initialize = function()
    {
        if( this.initialize != null && 
                    this.initialized == false ) {
            this.initialize( this, level );
            this.initialized = true;
        }
        this.Activate();
    }
    this.update = update;
    this.Update = function() {
        if( this.update != null )
            this.update( this, level );
    }
    this.destroy = destroy;
    this.Destroy = function() {
        if( this.destroy != null )
            this.destroy( this, level );
        this.Deactivate();
    }
    this.GetX = function() { 
        return this.sprite.x;
    }
    this.GetY = function() { 
        return this.sprite.y;
    }
    this.GetOrientation = function() {
        return this.sprite.orientation;
    }
    this.GetActive = function() {
        return this.active;
    }
    this.SetX = ( x ) => {
        this.sprite.x = x;
    }
    this.SetY = ( y ) => {
        this.sprite.y = y;
    }
    this.Rotate = ( radians ) => {
        this.sprite.Rotate( radians );
    }
    this.Activate = function()
    {
        console.log( "Leaf.Activate()" );
        this.active = true;
        if( sprites.indexOf( this.sprite ) <= -1 )
        {
            console.log( "Before Add: " + sprites );
            sprites.push( this.sprite );
            console.log( "After Add: " + sprites );
        }
        console.log( "End Leaf.Activate()" );
    }
    this.Deactivate = function()
    {
        console.log( "Leaf.Deactivate()" );
        this.active = false;
        const SPRITE_INDEX = sprites.indexOf( this.sprite );
        console.log( "Sprite index: " + SPRITE_INDEX );
        if( SPRITE_INDEX > -1 )
        {
            console.log( "Before splice: " + sprites );
            sprites.splice( SPRITE_INDEX, 1 );
            console.log( "After spliec: " + sprites );
        }
        console.log( "End Leaf.Deactivate()" );
    }
}

function Leaf( x, y, level, active = false, alternativeLeafFunction = null )
{
    leafObject = new LevelObject( leafImage, x, y, active );
    leafObject.sprite.scaleFactor = 1 / 2;
    leafObject.sprite.orientation = 3 * Math.PI / 2;
    leafObject.update = alternativeLeafFunction;
    console.log( "X: " + leafObject.GetX() + ", Y: " + leafObject.GetY() )
    if( leafObject.update == null )
    {
        leafObject.update = function( leaf, level )
        {
            if( Math.floor( Math.abs( ( ShellbyX() * grid.UnitToPixelX( canvas ) ) - leaf.GetX() ) ) < Number.EPSILON && 
                    Math.floor( Math.abs( ( ShellbyY() * grid.UnitToPixelY( canvas ) ) - leaf.GetY() ) ) < Number.EPSILON ) {
                console.log( "Leaf X: " + leaf.GetX() + ", Leaf Y: " + leaf.GetY() + ", Shellby X: " + shellby.x + ", Shellby Y: " + shellby.y );
                console.log( "Difference X: " + Math.floor( Math.abs( ( ShellbyX() * grid.UnitToPixelX( canvas ) ) - leaf.GetX() ) ) + 
                            ", Difference Y: " + Math.floor( Math.abs( ( ShellbyY() * grid.UnitToPixelY( canvas ) ) - leaf.GetY() ) ) );
                shellbyCommandQueCompanion.push( 'EatLeaf' );
                leaf.destroyed = true;
            }
        };
    }
    return leafObject;
}

function Level( name, checkGoalsFunction, goalText, initialize = null, update = null, destroy = null, resetShellby = null )
{
    this.name = name;
    this.levelObjects = new Array();
    this.goalText = goalText;
    this.checkGoalsFunction = checkGoalsFunction;
    this.initialize = initialize;
    this.initialized = false;
    this.update = update;
    this.destroy = destroy;
    this.resetShellby = resetShellby;
    this.ResetShellby = function()
    {
        if( resetShellby == null )
        {
            /*while( Math.abs( shellby.orientation % ( 2 * Math.PI ) ) > Number.EPSILON || 
                    ( Math.abs( shellby.orientation % ( 2 * Math.PI ) ) - ( 2 * Math.PI ) ) > Number.EPSILON || 
                    Math.abs( ( ( shellby.orientation % ( 2 * Math.PI ) ) / ( 2 * Math.PI ) ) - 1.0 ) > Number.EPSILON )
            {
                shellby.RotateClockwise();
                shellby.Animate();
                console.log( shellby.orientation % ( 2 * Math.PI ) );
            }*/
            shellby.orientation = 0.0;
            shellby.Animate();
            shellby.x = SHELLBY_DEFAULT_X;
            shellby.y = SHELLBY_DEFAULT_Y;
        }
        else
            this.resetShellby();
    }
    this.Initialize = () => 
    {
        if( this.initialize != null && this.initialized == false ) {
            this.initialize( this );
            this.initialized = true;
        }
        else if( this.initialize != null )
        {
            this.Destroy();
            this.initialize( this );
            this.initialized = true;
        }
        this.levelObjects.forEach( element => {
            element.Initialize();
        }, this );
    }
    this.Update = () => 
    {
        if( this.update != null )
            this.update( this );
        var toRemove = new Array();
        this.levelObjects.forEach( element => {
            element.Update();
            if( element.destroyed == true )
                toRemove.push( this.levelObjects.indexOf( element ) );
        }, this );
        toRemove.forEach( element => {
            this.levelObjects[ element ].Deactivate();
        }, this );
        toRemove.forEach( element => {
            this.levelObjects.splice( element, 1 );
        }, this );
    }
    this.Destroy = () => 
    {
        this.levelObjects.forEach( element => {
            element.Destroy();
        }, this );
        if( this.destroy != null )
            this.destroy( this );
    }
    this.CheckGoals = function() {
        return this.checkGoalsFunction( this );
    }
    this.PushLeaf = function( x, y, alternativeLeafFunction = null ) {
        this.AddLevelObject( new Leaf( x, y, this, false, alternativeLeafFunction ), true );
    }
    this.AddLevelObject = function( objectToAdd, initialize = false )
    {
        objectToAdd.level = this;
        if( initialize == true )
            objectToAdd.Initialize();
        this.levelObjects.push( objectToAdd );
    }
    this.AddLevelObjects = ( objectsToAdd, initialize = false ) =>
    {
        const START = this.levelObjects.length;
        this.levelObjects = this.levelObjects.concat( objectsToAdd );
        for( var i = START; i < this.levelObjects.length; ++i )
        {
            this.levelObjects[ i ].level = this;
            if( initialize == true )
                this.levelObjects[ i ].Initialize();
        }
    }
    this.Activate = () =>
    {
        this.levelObjects.forEach( element => {
            element.Activate();
        }, this );
    }
    this.Deactivate = () =>
    {
        this.levelObjects.forEach( element => {
            element.Deactivate();
        }, this );
    }
}

function LoadSprites()
{
    var sprites = new Array();
    var shellbyImage = new Image( 1280, 256 );
    leafImage = new Image( 256, 256 );
    shellbyImage.src = '../ArtAssets/Shellby/ShellbyWalkCycle.png';
    leafImage.src = '../ArtAssets/Leaf.png';
    shellby = new Sprite( shellbyImage, 256, 256 );
    shellby.AddAnimationCycle( 
            [ new AnimationPoint( 0, 0 ), 
            new AnimationPoint( 1, 0 ), 
            new AnimationPoint( 2, 0 ), 
            new AnimationPoint( 3, 0 ), 
            new AnimationPoint( 4, 0 ) ] );
    shellby.SelectAnimationCycle( 1 );
    shellby.scaleFactor = 1 / 2.5;
    shellby.x = SHELLBY_DEFAULT_X;
    shellby.y = SHELLBY_DEFAULT_Y;
    sprites.push( shellby );
    return sprites;
}

starting = 0;

lastFrameWasReset = false;

startedFirstLevel = false;

function Render()
{
    renderContext.clearRect( 0, 0, canvas.width, canvas.height );
    if( startedFirstLevel == false )
    {
        levels[ currentLevel ].Initialize();
        goalBox.textContent = levels[ currentLevel ].goalText;
        startedFirstLevel = true;
    }
    if( lastFrameWasReset == false )
    {
        if( currentLevel < levels.length && levels.length > 0 )
        {
            levels[ currentLevel ].Update();
            console.log( "Goal: " + levels[ currentLevel ].CheckGoals() );
            if( levels[ currentLevel ].CheckGoals() > 0 )
            {
                alert( "GREAT JOB!!" );
                levels[ currentLevel ].Destroy();
                if( ( currentLevel + 1 ) < levels.length ) {
                    levels[ ++currentLevel ].Initialize();
                    goalBox.textContent = levels[ currentLevel ].goalText;
                }
                else
                    ++currentLevel;
            }
        }
        if( shellbyCommandQue.length > 0 )
            shellbyCommandQue.shift()();
    }
    else
        lastFrameWasReset = false;
    for( var i = 0; i < sprites.length; ++i )
        sprites[ i ].Animate();
    grid.Draw( renderContext, canvas );
    if( reset == true ) {
        Reset();
        lastFrameWasReset = true;
    }
    setTimeout( Render, speedSlider.value );
}

Render();

function CharacterControlAPI()
{
    return { 
        shellbyAngle: ShellbyAngle,
        shellbyLeft: QueShellbyCounterClockWise, 
        shellbyRight: QueShellbyClockWise,
        shellbyClockwise: QueShellbyClockWise, 
        shellbyCounterClockwise: QueShellbyCounterClockWise,
        shellbyX: ShellbyX,
        shellbyY: ShellbyY, 
        shellbyForward: QueShellbyForward,
        shellbyBackward: QueShellbyBackward
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
    shellbyCommandQueCompanion = new Array();
    ResetLuaVirtualMachine( vm );
    Compile( currentRunningCode = editor.getValue() );
}


function Run() {
    reset = true;
}

function Reset()
{
    shellbyCommandQue = new Array();
    shellbyCommandQueCompanion = new Array();
    shellby.transformQue = new Array();
    if( currentLevel < levels.length )
    {
        levels[ currentLevel ].ResetShellby();
        levels[ currentLevel ].Initialize();
        shellbyCommandQue = new Array();
        shellbyCommandQueCompanion = new Array();
    }
    RunCode();
    reset = false;
}
