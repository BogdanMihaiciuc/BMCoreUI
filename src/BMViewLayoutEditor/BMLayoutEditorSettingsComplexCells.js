//@ts-check

import { BMView } from "../BMView/BMView_v2.5";
import { BMExtend, BMStringByCapitalizingString, NO, YES } from "../Core/BMCoreUI";
import { BMInsetMake } from "../Core/BMInset";
import { BMSizeMake } from "../Core/BMSize";
import { BMLayoutEditorSettingsCell, BMLayoutEditorSettingsTitleView } from "./BMLayoutEditorSettingCells";

// @type BMLayoutEditorSettingsSizeCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying `BMSize` settings.
 */
export function BMLayoutEditorSettingsSizeCell () {} // <constructor>

BMLayoutEditorSettingsSizeCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsSizeCell,

    /**
     * The view that displays this setting's title.
     */
    _titleView: undefined, // <BMView>
    get titleView() {
        return this._titleView;
    },

    /**
     * The view that displays this setting's width input node.
     */
    _widthInputView: undefined, // <BMView>
    get widthInputView() {
        return this._widthInputView;
    },

    /**
     * The view that displays this setting's height input node.
     */
    _heightInputView: undefined, // <BMView>
    get heightInputView() {
        return this._heightInputView;
    },

    /**
     * The view that displays this setting's bounding box indicator node.
     */
    _indicator: undefined, // <BMView>
    get indicator() {
        return this._indicator;
    },

    /**
     * Set to `YES` while this cell is bound.
     */
    _bound: NO, // <Boolean>

    // @override - BMCollectionViewCell
    prepareForReuse() {
        this._bound = NO;
    },

    // @override - BMCollectionViewCell
    prepareForDisplay() {
        this._bound = YES;
    },

    /**
     * Constructs and returns a numeric input view.
     * @returns <BMView>        A view.
     */
    _createInputView() {
        const inputNode = document.createElement('input');
        inputNode.className = 'BMWindowInput BMLayoutEditorDetailsCellInput BMLayoutEditorDetailsItemNumericValue';
        inputNode.type = 'number';

        const inputView = BMView.viewForNode(inputNode);
        inputView.debuggingName = 'InputView';
        inputView.supportsAutomaticIntrinsicSize = YES;

        return inputView;
    },

    // @override - BMCollectionViewCell
    initWithCollectionView(collectionView, args) {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        this._titleView = BMLayoutEditorSettingsTitleView.titleView();
        this.contentView.addSubview(this._titleView);

        this._titleView.leading.equalTo(this.contentView.leading, {plus: 8}).isActive = YES;
        this._titleView.top.equalTo(this.contentView.top, {plus: 4}).isActive = YES;

        this._indicator = BMView.view();
        this._indicator.node.className = 'BMLayoutEditorDetailsBoxIndicator';

        const widthIndicator = document.createElement('div');
        widthIndicator.className = 'BMLayoutEditorDetailsWidthIndicator';
        this._indicator.node.appendChild(widthIndicator);

        const heightIndicator = document.createElement('div');
        heightIndicator.className = 'BMLayoutEditorDetailsHeightIndicator';
        this._indicator.node.appendChild(heightIndicator);

        this.contentView.addSubview(this._indicator);
        this._indicator.height.equalTo(40).isActive = YES;
        this._indicator.width.equalTo(40).isActive = YES;

        this._widthInputView = this._createInputView();
        this.contentView.addSubview(this._widthInputView);
        this._widthInputView.width.equalTo(64).isActive = YES;
        this._widthInputView.node.style.textAlign = 'center';

        this._heightInputView = this._createInputView();
        this.contentView.addSubview(this._heightInputView);
        this._heightInputView.width.equalTo(64).isActive = YES;
        this._heightInputView.node.style.textAlign = 'right';

        // Width goes below title, then box indicator below it
        this._widthInputView.top.equalTo(this._titleView.bottom, {plus: -4}).isActive = YES;
        this._indicator.top.equalTo(this._widthInputView.bottom, {plus: 12}).isActive = YES;
        this._indicator.bottom.lessThanOrEqualTo(this.contentView.bottom, {plus: -4}).isActive = YES;
        this._heightInputView.centerY.equalTo(this._indicator.centerY).isActive = YES;

        // Box indicator's center X is at 50%, input boxes are placed around it
        this._indicator.centerX.equalTo(this.contentView.centerX, {priority: 750}).isActive = YES;
        this._indicator.leading.equalTo(this._heightInputView.trailing, {plus: 12}).isActive = YES;
        this._widthInputView.centerX.equalTo(this._indicator.centerX).isActive = YES;
        this.contentView.trailing.greaterThanOrEqualTo(this._indicator.trailing, {plus: 8}).isActive = YES;

        [this._widthInputView, this._heightInputView].forEach(inputView => {
            const inputNode = inputView.node;

            inputNode.addEventListener('input', event => {
                if (!this._bound) return;
    
                this._inputValueDidChangeWithEvent(event);
            });
    
            inputNode.addEventListener('paste', event => {
                if (!this._bound) return;
    
                this._inputValueDidChangeWithEvent(event);
            });
    
            inputNode.addEventListener('focus', e => this.retain());
            inputNode.addEventListener('blur', e => this.release());
        });


        return this;
    },

    // @override - BMCollectionViewSettingsCell
    cellDidBindToSetting(setting) {
        this._titleView.setting = setting;

        let size;
        if (setting.sizeClass) {
            if (setting.target._variations[setting.sizeClass]) {
                if (setting.property in setting.target._variations[setting.sizeClass]) {
                    setting.target._variations[setting.sizeClass][setting.property];
                }
            }
        }
        else {
            size = setting.target[setting.property];
        }

        if (size) {
            this._widthInputView.node.value = size.width;
            this._heightInputView.node.value = size.height;
        }
        else {
            this._widthInputView.node.value = '';
            this._heightInputView.node.value = '';
        }
    },

    /**
     * Invoked when the value of either the width or height inputs changes.
     * @param event <UIEvent>       The event that triggered this action.
     */
    _inputValueDidChangeWithEvent(event) {
        const setting = this.setting;

        const width = parseInt(this._widthInputView.node.value, 10);
        const height = parseInt(this._heightInputView.node.value, 10);

        let size = !isNaN(width) && !isNaN(height) ? BMSizeMake(width, height) : undefined;

        // If the property is non-nullable default to [0, 0]
        if (!setting.nullable && !size) {
            size = BMSizeMake();
        }

        this.layoutEditor.setValue(size, {forSetting: setting});
    }


});

// @endtype

// @type BMLayoutEditorSettingInsetCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying `BMInset` settings.
 */
 export function BMLayoutEditorSettingsInsetCell () {} // <constructor>

 BMLayoutEditorSettingsInsetCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
     constructor: BMLayoutEditorSettingsInsetCell,
 
     /**
      * The view that displays this setting's title.
      */
     _titleView: undefined, // <BMView>
     get titleView() {
         return this._titleView;
     },
 
     /**
      * The view that displays this setting's left input node.
      */
     _leftInputView: undefined, // <BMView>
     get leftInputView() {
         return this._leftInputView;
     },
 
     /**
      * The view that displays this setting's top input node.
      */
     _topInputView: undefined, // <BMView>
     get heightInputView() {
         return this._topInputView;
     },
 
     /**
      * The view that displays this setting's left input node.
      */
     _rightInputView: undefined, // <BMView>
     get rightInputView() {
         return this._rightInputView;
     },
 
     /**
      * The view that displays this setting's top input node.
      */
     _bottomInputView: undefined, // <BMView>
     get bottomInputView() {
         return this._bottomInputView;
     },
 
     /**
      * The view that displays this setting's bounding box indicator node.
      */
     _indicator: undefined, // <BMView>
     get indicator() {
         return this._indicator;
     },
 
     /**
      * Set to `YES` while this cell is bound.
      */
     _bound: NO, // <Boolean>
 
     // @override - BMCollectionViewCell
     prepareForReuse() {
         this._bound = NO;
     },
 
     // @override - BMCollectionViewCell
     prepareForDisplay() {
         this._bound = YES;
     },
 
     /**
      * Constructs and returns a numeric input view.
      * @returns <BMView>        A view.
      */
     _createInputView() {
         const inputNode = document.createElement('input');
         inputNode.className = 'BMWindowInput BMLayoutEditorDetailsCellInput BMLayoutEditorDetailsItemNumericValue';
         inputNode.type = 'number';
 
         const inputView = BMView.viewForNode(inputNode);
         inputView.debuggingName = 'InputView';
         inputView.supportsAutomaticIntrinsicSize = YES;
 
         return inputView;
     },
 
     // @override - BMCollectionViewCell
     initWithCollectionView(collectionView, args) {
         BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);
 
         this._titleView = BMLayoutEditorSettingsTitleView.titleView();
         this.contentView.addSubview(this._titleView);
 
         this._titleView.leading.equalTo(this.contentView.leading, {plus: 8}).isActive = YES;
         this._titleView.top.equalTo(this.contentView.top, {plus: 4}).isActive = YES;
 
         this._indicator = BMView.view();
         this._indicator.node.className = 'BMLayoutEditorDetailsBoxIndicator';

         const topLeftIndicator = document.createElement('div');
         topLeftIndicator.className = 'BMLayoutEditorDetailsInsetTopLeftIndicator';
         this._indicator.node.appendChild(topLeftIndicator);
 
         const bottomRightIndicator = document.createElement('div');
         bottomRightIndicator.className = 'BMLayoutEditorDetailsInsetBottomRightIndicator';
         this._indicator.node.appendChild(bottomRightIndicator);

         this.contentView.addSubview(this._indicator);
         this._indicator.height.equalTo(48).isActive = YES;
         this._indicator.width.equalTo(48).isActive = YES;
 
         this._leftInputView = this._createInputView();
         this.contentView.addSubview(this._leftInputView);
         this._leftInputView.width.equalTo(64).isActive = YES;
         this._leftInputView.node.style.textAlign = 'right';
 
         this._topInputView = this._createInputView();
         this.contentView.addSubview(this._topInputView);
         this._topInputView.width.equalTo(64).isActive = YES;
         this._topInputView.node.style.textAlign = 'center';
 
         this._rightInputView = this._createInputView();
         this.contentView.addSubview(this._rightInputView);
         this._rightInputView.width.equalTo(64).isActive = YES;
 
         this._bottomInputView = this._createInputView();
         this.contentView.addSubview(this._bottomInputView);
         this._bottomInputView.width.equalTo(64).isActive = YES;
         this._bottomInputView.node.style.textAlign = 'center';
 
         // Top goes below title, then box indicator below it, then bottom below it
         this._topInputView.top.equalTo(this._titleView.bottom, {plus: -4}).isActive = YES;
         this._indicator.top.equalTo(this._topInputView.bottom, {plus: 4}).isActive = YES;
         this._bottomInputView.top.equalTo(this._indicator.bottom, {plus: 4}).isActive = YES;
         this._bottomInputView.bottom.lessThanOrEqualTo(this.contentView.bottom, {plus: -4}).isActive = YES;
         this._leftInputView.centerY.equalTo(this._indicator.centerY).isActive = YES;
         this._rightInputView.centerY.equalTo(this._indicator.centerY).isActive = YES;
 
         // Box indicator's center X is at 50%, input boxes are placed around it
         this._indicator.centerX.equalTo(this.contentView.centerX, {priority: 750}).isActive = YES;
         this._indicator.leading.equalTo(this._leftInputView.trailing, {plus: 4}).isActive = YES;
         this._rightInputView.leading.equalTo(this._indicator.trailing, {plus: 4}).isActive = YES;
         this._topInputView.centerX.equalTo(this._indicator.centerX).isActive = YES;
         this._bottomInputView.centerX.equalTo(this._indicator.centerX).isActive = YES;
         this._topInputView.centerX.equalTo(this._indicator.centerX).isActive = YES;
         this.contentView.trailing.greaterThanOrEqualTo(this._rightInputView.trailing, {plus: 8}).isActive = YES;
 
         [this._leftInputView, this._topInputView, this._rightInputView, this._bottomInputView].forEach(inputView => {
             const inputNode = inputView.node;
 
             inputNode.addEventListener('input', event => {
                 if (!this._bound) return;
     
                 this._inputValueDidChangeWithEvent(event);
             });
     
             inputNode.addEventListener('paste', event => {
                 if (!this._bound) return;
     
                 this._inputValueDidChangeWithEvent(event);
             });
     
             inputNode.addEventListener('focus', e => this.retain());
             inputNode.addEventListener('blur', e => this.release());
         });
 
 
         return this;
     },
 
     // @override - BMCollectionViewSettingsCell
     cellDidBindToSetting(setting) {
         this._titleView.setting = setting;
 
         let inset;
         if (setting.sizeClass) {
             if (setting.target._variations[setting.sizeClass]) {
                 if (setting.property in setting.target._variations[setting.sizeClass]) {
                     setting.target._variations[setting.sizeClass][setting.property];
                 }
             }
         }
         else {
             inset = setting.target[setting.property];
         }
 
         if (inset) {
             this._leftInputView.node.value = inset.left;
             this._topInputView.node.value = inset.top;
             this._rightInputView.node.value = inset.right;
             this._bottomInputView.node.value = inset.bottom;
         }
         else {
             this._leftInputView.node.value = '';
             this._topInputView.node.value = '';
             this._rightInputView.node.value = '';
             this._bottomInputView.node.value = '';
         }
     },
 
     /**
      * Invoked when the value of either the width or height inputs changes.
      * @param event <UIEvent>       The event that triggered this action.
      */
     _inputValueDidChangeWithEvent(event) {
         const setting = this.setting;
 
         const left = parseInt(this._leftInputView.node.value, 10);
         const top = parseInt(this._topInputView.node.value, 10);
         const right = parseInt(this._rightInputView.node.value, 10);
         const bottom = parseInt(this._bottomInputView.node.value, 10);
 
         let inset = !isNaN(left) && !isNaN(top) && !isNaN(right) && !isNaN(bottom) ? BMInsetMake(left, top, right, bottom) : undefined;
 
         // If the property is non-nullable default to [0, 0]
         if (!setting.nullable && !inset) {
             inset = BMInsetMake();
         }
 
         this.layoutEditor.setValue(inset, {forSetting: setting});
     }
 
 
 });
 
 // @endtype