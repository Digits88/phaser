/**
 * @author       Benjamin D. Richards <benjamindrichards@gmail.com>
 * @copyright    2013-2024 Phaser Studio Inc.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var Class = require('../../../../utils/Class');
var Utils = require('../../Utils.js');
var SubmitterQuad = require('./SubmitterQuad');

var getTint = Utils.getTintAppendFloatAlpha;

/**
 * @classdesc
 * The SubmitterTile RenderNode submits data for tiles.
 *
 * @class SubmitterTile
 * @extends Phaser.Renderer.WebGL.RenderNodes.SubmitterQuad
 * @memberof Phaser.Renderer.WebGL.RenderNodes
 * @constructor
 * @since 3.90.0
 * @param {Phaser.Renderer.WebGL.WebGLRenderer} manager - The WebGLRenderer that owns this Submitter.
 * @param {object} [config] - The configuration object for this Submitter.
 * @param {string} [config.name='SubmitterTile'] - The name of this Submitter.
 * @param {string} [config.role='Submitter'] - The role of this Submitter.
 * @param {string} [config.batchHandler='BatchHandler'] - The key of the default batch handler node to use for this Submitter. This should correspond to a node which extends `BatchHandlerTile`. It will be derived from the game object whenever the node runs.
 */
var SubmitterTile = new Class({
    Extends: SubmitterQuad,

    initialize: function SubmitterTile (manager, config)
    {
        SubmitterQuad.call(this, manager, config);

        this._renderOptions.clampFrame = true;
    },

    /**
     * The default configuration for this RenderNode.
     *
     * @name Phaser.Renderer.WebGL.RenderNodes.SubmitterTile#defaultConfig
     * @type {object}
     */
    defaultConfig: {
        name: 'SubmitterTile',
        role: 'Submitter',
        batchHandler: 'BatchHandler'
    },

    /**
     * Submit data for rendering.
     *
     * @method Phaser.Renderer.WebGL.RenderNodes.SubmitterTile#run
     * @since 3.90.0
     * @param {Phaser.Renderer.WebGL.DrawingContext} drawingContext - The current drawing context.
     * @param {Phaser.GameObjects.GameObject} gameObject - The GameObject being rendered.
     * @param {Phaser.GameObjects.Components.TransformMatrix} parentMatrix - The parent matrix of the GameObject.
     * @param {object} [element] - The specific element within the game object. This is used for objects that consist of multiple quads.
     * @param {Phaser.Renderer.WebGL.RenderNodes.TexturerTileSprite|Omit<Phaser.Renderer.WebGL.RenderNodes.TexturerTileSprite, 'run'>} texturerNode - The texturer node used to texture the GameObject. You may pass a texturer node or an object containing equivalent data without a `run` method.
     * @param {Phaser.Renderer.WebGL.RenderNodes.TransformerTileSprite|{ quad: Float32Array }} transformerNode - The transformer node used to transform the GameObject. You may pass a transformer node or an object with a `quad` property.
     * @param {Phaser.Renderer.WebGL.RenderNodes.RenderNode|Omit<Phaser.Renderer.WebGL.RenderNodes.RenderNode, 'run'>} [tinterNode] - The tinter node used to tint the GameObject. You may pass a tinter node or an object containing equivalent data without a `run` method. If omitted, no tinting will be used.
     * @param {Phaser.Renderer.WebGL.Wrappers.WebGLTextureWrapper} [normalMap] - The normal map texture to use for lighting. If omitted, the normal map texture of the GameObject will be used, or the default normal map texture of the renderer.
     * @param {number} [normalMapRotation] - The rotation of the normal map texture. If omitted, the rotation of the GameObject will be used.
     */
    run: function (
        drawingContext,
        gameObject,
        parentMatrix,
        element,
        texturerNode,
        transformerNode,
        tinterNode,
        normalMap,
        normalMapRotation
    )
    {
        this.onRunBegin(drawingContext);

        var cameraAlpha = drawingContext.camera.alpha;
        var tintFill, tintTopLeft, tintBottomLeft, tintTopRight, tintBottomRight;

        if (texturerNode.run)
        {
            texturerNode.run(drawingContext, gameObject, element);
        }
        if (transformerNode.run)
        {
            transformerNode.run(drawingContext, gameObject, parentMatrix, element, texturerNode);
        }
        if (tinterNode)
        {
            if (tinterNode.run)
            {
                tinterNode.run(drawingContext, gameObject, element);
            }
            tintFill = tinterNode.tintFill;
            tintTopLeft = tinterNode.tintTopLeft;
            tintBottomLeft = tinterNode.tintBottomLeft;
            tintTopRight = tinterNode.tintTopRight;
            tintBottomRight = tinterNode.tintBottomRight;
        }
        else
        {
            tintFill = gameObject.tintFill;
            var tint = getTint(0xffffffff, cameraAlpha);
            tintTopLeft = tint;
            tintBottomLeft = tint;
            tintTopRight = tint;
            tintBottomRight = tint;
        }

        var frame = texturerNode.frame;
        var quad = transformerNode.quad;
        var uvSource = texturerNode.uvSource;
        var u0 = uvSource.u0;
        var v0 = uvSource.v0;
        var u1 = uvSource.u1;
        var v1 = uvSource.v1;

        this.setRenderOptions(gameObject, normalMap, normalMapRotation);

        (
            gameObject.customRenderNodes[this.batchHandler] ||
            gameObject.defaultRenderNodes[this.batchHandler]
        ).batch(
            drawingContext,

            // Use `frame.source.glTexture` instead of `frame.glTexture`
            // to avoid unnecessary getter function calls.
            frame.source.glTexture,

            // Transformed quad in order TL, BL, TR, BR:
            quad[0], quad[1],
            quad[2], quad[3],
            quad[6], quad[7],
            quad[4], quad[5],

            // Texture coordinates in X, Y, Width, Height:
            u0, v0, u1 - u0, v1 - v0,

            // Frame coordinates in order TL, BL, TR, BR:
            u0, v0,
            u0, v1,
            u1, v0,
            u1, v1,

            tintFill,

            // Tint colors in order TL, BL, TR, BR:
            tintTopLeft, tintBottomLeft, tintTopRight, tintBottomRight,

            // Extra render options:
            this._renderOptions
        );

        this.onRunEnd(drawingContext);
    }
});

module.exports = SubmitterTile;