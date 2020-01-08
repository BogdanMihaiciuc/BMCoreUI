// @ts-check

import {YES, NO} from '../Core/BMCoreUI'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMakeWithNodeFrame} from '../Core/BMRect'
import {BMIndexPathMakeWithRow} from '../Core/BMIndexPath'
import {__BMVelocityAnimate} from '../Core/BMAnimationContext'
import {BMMenuKind} from '../BMView/BMMenu'
import {BMCollectionViewCell} from '../BMCollectionView/BMCollectionViewCell'
import { _BMLayoutEditorSettingsView } from './BMLayoutEditorSettings'

// @type BMLayoutEditorVariableCell extends BMCollectionViewCell

/**
 * A collection view cell that represents a layout variable, used by the layout editor.
 */
export class BMLayoutEditorVariableCell extends BMCollectionViewCell {

    initWithCollectionView(collectionView, args) {
        super.initWithCollectionView(collectionView, args);

        const node = args.node;

        node.classList.add('BMLayoutEditorVariable');
        
        const sizeClassBadge = document.createElement('div');
        sizeClassBadge.className = 'BMLayoutEditorDetailsItemBadgeIcon';
        this.sizeClassBadge = sizeClassBadge;
        node.appendChild(sizeClassBadge);

        const name = document.createElement('input');
        name.type = 'text';
        name.className = 'BMWindowInput BMLayoutEditorVariableName';
        this.variableName = name;
        node.appendChild(name);
        this._initNameEditor();

        const value = document.createElement('input');
        value.type = 'number';
        value.className = 'BMWindowInput BMLayoutEditorVariableValue';
        this.variableValue = value;
        node.appendChild(value);
        this._initValueEditor();

        const addVariationButton = document.createElement('div');
        addVariationButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton BMLayoutEditorVariableButton BMLayoutEditorAddVariationButton';
        addVariationButton.innerHTML = '<i class="material-icons">add_circle</i>';
        node.appendChild(addVariationButton);
        this.addVariationButton = addVariationButton;
        this._initAddVariationButton();

        const removeVariationButton = document.createElement('div');
        removeVariationButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton BMLayoutEditorVariableButton BMLayoutEditorRemoveVariationButton';
        removeVariationButton.innerHTML = '<i class="material-icons">remove_circle</i>';
        node.appendChild(removeVariationButton);
        this.removeVariationButton = removeVariationButton;
        this._initRemoveVariationButton();

        return this;
    }

    /**
     * Initializes the action that occurs upon clicking on the add variation button.
     */
    _initAddVariationButton() {
        this.addVariationButton.addEventListener('click', event => {
            // TODO check if a variation already exists for this size class; ideally filter the menu
            this.editor._showSizeClassMenuAtPoint(BMRectMakeWithNodeFrame(this.addVariationButton).center, {kind: BMMenuKind.Menu, action: sizeClass => {
                // Update the UI with the new value
                this.collectionView.dataSet.beginUpdates();
                this.collectionView.dataSet.variables.splice(this.indexPath.row + 1, 0, {name: this.indexPath.object.name, sizeClass, value: this.indexPath.object.value});
                const newRow = this.indexPath.row + 1;
                this.collectionView.dataSet.commitUpdatesWithCompletionHandler(() => {
                    // After the animation finishes, focus the new property's name
                    var newVariableIndexPath = this.collectionView.indexPathForObjectAtRow(newRow, {inSectionAtIndex: 0});
                    var newVariableCell = this.collectionView.cellAtIndexPath(newVariableIndexPath);
                    
                    if (newVariableCell) {
                        newVariableCell.node.querySelector('.BMLayoutEditorVariableValue').focus();
                
                        this.collectionView.scrollToCellAtIndexPath(newVariableIndexPath, {animated: YES});
                    }
                    else {
                        // If the newly created property is not in view, its cell must be created before it can be focused
                        newVariableCell = propertiesCollection.retainCellForIndexPath(newVariableIndexPath);
                        newVariableCell.node.querySelector('.BMLayoutEditorVariableValue').focus();
                        
                        // Because any input acquiring focus will cause its owning cell to be retained, the cell may be released from here
                        newVariableCell.release();
                
                        this.collectionView.scrollToCellAtIndexPath(newVariableIndexPath, {animated: YES});
                    }
                });;

                // Push this update to the backing variable provider
                this.editor.layoutVariableProvider.setLayoutVariableValue(this.indexPath.object.value, {named: this.indexPath.object.name, inSizeClass: sizeClass});
            }});
        });
    }

    /**
     * Initializes the action that ocdurs upon clicking on the remove variation or remove variable button.
     */
    _initRemoveVariationButton() {
        this.removeVariationButton.addEventListener('click', event => {
            const variables = this.collectionView.dataSet.variables;
            // This button behaves differently depending on whether it is pressed on a variation or a variable definition
            // For variations, this should just remove the variation
            if (this.indexPath.object.sizeClass) {
                // Update the UI
                this.collectionView.dataSet.beginUpdates();
                variables.splice(this.indexPath.row, 1);
                this.collectionView.dataSet.commitUpdates();

                // And unregister the variation from the variable provider
                this.editor.layoutVariableProvider.removeVariationForLayoutVariableNamed(this.indexPath.object.name, {inSizeClass: this.indexPath.object.sizeClass});
            }
            else {
                // For variable definitions, this should unregister all size class variations and also remove the variable itself
                // TODO: Verify that the variable is not used referened and provide a warning if it is
                this.collectionView.dataSet.beginUpdates();
                for (let i = 0; i < variables.length; i++) {
                    const variable = variables[i];
                    if (variable.name == this.indexPath.object.name) {
                        // Remove the variation or variable from the provider
                        if (variable.sizeClass) {
                            this.editor.layoutVariableProvider.removeVariationForLayoutVariableNamed(variable.name, {inSizeClass: variable.sizeClass});
                        }
                        else {
                            this.editor.layoutVariableProvider.unregisterLayoutVariableNamed(variable.name);
                        }

                        // Update the UI's backing data set
                        variables.splice(i, 1);
                        i--;
                    }
                }

                this.collectionView.dataSet.commitUpdates();
            }
        });
    }

    /**
     * Initializes the name editor behaviours.
     */
    _initNameEditor() {
        let initialName;

        this.variableName.addEventListener('focus', async event => {
            initialName = this._variable.name;
            this.variableName.select();
            this.retain();
            const fn = event => event.preventDefault();
            this.variableName.addEventListener('mouseup', fn);
            await new Promise(resolve => setTimeout(resolve, 200));
            this.variableName.removeEventListener('mouseup', fn);
        });
        this.variableName.addEventListener('blur', async event => {
            let newName = this.variableName.value.trim();
            if (newName != initialName) {
                // Check that this new name is not used by any other variable
                let hasNewName = NO;
                for (const variable of this.collectionView.dataSet.variables) {
                    if (variable.name == newName) {
                        hasNewName = YES;
                        break;
                    }
                }

                if (!hasNewName) {
                    // Instruct the variable provider to rename the layout variable
                    this.editor.layoutVariableProvider.renameLayoutVariableNamed(initialName, {toName: newName});

                    // Also update the data set item backing the UI
                    for (const variable of this.collectionView.dataSet.variables) {
                        if (variable.name == initialName) {
                            variable.name = newName;
                        }
                    }
                }
                else {
                    // If there are naming collisions, restore the initial name
                    this.variableName.value = initialName;

                    await __BMVelocityAnimate(this.variableName, {translateX: '20px'}, {duration: 50, ease: 'easeOutQuad'});
                    await __BMVelocityAnimate(this.variableName, {translateX: '-20px'}, {duration: 100, ease: 'easeInOutQuad'});
                    __BMVelocityAnimate(this.variableName, {translateX: '0px'}, {duration: 50, ease: 'easeInQuad'})
                }
            }
            this.release();
        });
    }

    _initValueEditor() {
        this.variableValue.addEventListener('focus', async event => {
            this.variableValue.select();
            this.retain();
            const fn = event => event.preventDefault();
            this.variableValue.addEventListener('mouseup', fn);
            await new Promise(resolve => setTimeout(resolve, 200));
            this.variableValue.removeEventListener('mouseup', fn);
        });
        this.variableValue.addEventListener('input', event => {
            let newValue = parseFloat(this.variableValue.value.trim());
            if (!isNaN(newValue)) {
                // Update the local value of the variable
                this._variable.value = newValue;
                // Instruct the provider to update the value as well
                if (this._variable.sizeClass) {
                    this.editor.layoutVariableProvider.setLayoutVariableValue(newValue, {named: this._variable.name, inSizeClass: this._variable.sizeClass});
                }
                else {
                    this.editor.layoutVariableProvider.registerLayoutVariableNamed(this._variable.name, {withValue: newValue});
                }
            }
        })
        this.variableValue.addEventListener('blur', async event => this.release());
    }

    /**
     * The represented layout variable variation.
     */
    get variable() { // <BMLayoutVariableVariation>
        return this._variable;
    }
    set variable(variable) {
        this._variable = variable;

        if (variable.sizeClass) {
            this.addVariationButton.style.visibility = 'hidden';
            this.sizeClassBadge.style.display = 'block';
            this.variableName.style.display = 'none';

            // TODO: Optimize this
            const badge = this.editor.settingsBadgeForSizeClass(variable.sizeClass);
            this.sizeClassBadge.className = badge.className;
            this.sizeClassBadge.innerText = badge.innerText;

            this.node.classList.remove('BMLayoutEditorVariableMain');
        }
        else {
            this.addVariationButton.style.visibility = 'visible';
            this.sizeClassBadge.style.display = 'none';
            this.variableName.style.display = 'block';

            this.node.classList.add('BMLayoutEditorVariableMain');
        }

        this.variableValue.value = variable.value;
        this.variableName.value = variable.name;
    }

}

// @endtype

// @type BMLayoutEditorEmptyVariablesCell extends BMCollectionViewCell

/**
 * A collection view cell that displays a message to the user when no layout variables are displayed.
 */
export class BMLayoutEditorEmptyVariablesCell extends BMCollectionViewCell {
    initWithCollectionView(collectionView, args) {
        super.initWithCollectionView(collectionView, args);

        const layoutVariablesAvailable = collectionView.dataSet.provider.canUseLayoutVariables();

        const title = document.createElement('div');
        title.innerText = layoutVariablesAvailable ? 'No Layout Variables Defined' : 'Layout Variables Unavailable';
        title.className = 'BMWindowLabel BMLayoutEditorMessageTitle';
        this.node.appendChild(title);

        const description = document.createElement('div');
        description.innerText = layoutVariablesAvailable ? 'Use the "Add Variable" button below to add a layout variable.' : collectionView.dataSet.provider.unavailableLayoutVariablesUserLabel();
        description.className = 'BMWindowLabel BMLayoutEditorMessageDescription';
        this.node.appendChild(description);

        this.node.classList.add('BMLayoutEditorEmptyVariableMessage');

        return this;
    }
}

// @endtype

// @type BMLayoutEditorVariablesDataSet implements BMCollectionViewDataSet, BMCollectionViewDelegate

/**
 * A data set object that manages the display of layout variables and their variations in a layout editor.
 */
export class BMLayoutEditorVariablesDataSet {

    /**
     * Initializes this data set with the given layout variable provider object.
     * @param provider <BMLayoutVariableProvider>       The layout variable provider to use.
     * {
     *  @param collectionView <BMCollectionView>        The collection view using this data set.
     *  @param editor <BMLayoutEditor>                  The layout editor using this data set.
     * } 
     * @return <BMLayoutEditorVariablesDataSet>         This data set object.
     */
    initWithLayoutVariableProvider(provider, {collectionView, editor}) {
        this.provider = provider;
        this.variables = [];

        // Build the flat list of layout variables which can be used by collection view
        const declaredVariables = provider.layoutVariables;
        for (const variable in declaredVariables) {
            this.variables.push({name: variable, value: declaredVariables[variable]});

            const variations = provider.variationsForLayoutVariableNamed(variable);
            for (const variation of variations) {
                this.variables.push(variation);
            }
        }

        this.collectionView = collectionView;
        this.editor = editor;
        return this;
    }

    numberOfSections() {
        return Math.min(this.variables.length, 1);
    }

    numberOfObjectsInSectionAtIndex(index) {
        return this.variables.length;
    }

    indexPathForObjectAtRow(row) {
        return BMIndexPathMakeWithRow(row, {section: 0, forObject: this.variables[row]});
    }

    indexPathForObject(object) {
        for (let i = 0; i < this.variables.length; i++) {
            const variable = this.variables[i];

            if (variable.name == object.name && variable.sizeClass == object.sizeClass) {
                return BMIndexPathMakeWithRow(i, {section: 0, object: variable});
            }
        }
    }

    cellForItemAtIndexPath(indexPath) {
        const cell = this.collectionView.dequeueCellForReuseIdentifier('Variable');
        cell.editor = this.editor;
        cell.variable = indexPath.object;
        return cell;
    }

    cellForSupplementaryViewWithIdentifier(identifier, args) {
        return this.collectionView.dequeueCellForSupplementaryViewWithIdentifier(identifier);
    }

    beginUpdates() {
        this._oldData = this.variables.slice();
        this._newData = this.variables;
    }

    useOldData(use) {
        if (use) {
            this.variables = this._oldData;
        }
        else {
            this.variables = this._newData;
        }
    }

    isUsingOldData() {
        return this.variables === this._newData;
    }

    commitUpdates() {
        return this.commitUpdatesWithCompletionHandler();
    }

    commitUpdatesWithCompletionHandler(handler) {
        this.collectionView.updateEntireDataAnimated(YES, {completionHandler: handler});
        this.variables = this._newData;
        this._oldData = undefined;
    }

    addVariable() {
        this.beginUpdates();

        let name = 'new variable';
        let i = 0;

        // Find a unique name for this new layout variable
        while (YES) {
            let hasName = NO;

            for (var j = 0; j < this.variables.length; j++) {
                if (this.variables[j].name == name) {
                    hasName = YES;
                    break;
                }
            }

            if (!hasName) {
                break;
            }
            else {
                i++;
                name = 'new variable ' + i;
            }
        }

        // Add it to the UI and to the provider
        this.variables.push({name: name, value: 0});
        this.provider.registerLayoutVariableNamed(name, {withValue: 0});

        this.commitUpdatesWithCompletionHandler(() => {
			// After the animation finishes, focus the new property's name
			var newVariableIndexPath = this.indexPathForObjectAtRow(this.variables.length - 1, {inSectionAtIndex: 0});
			var newVariableCell = this.collectionView.cellAtIndexPath(newVariableIndexPath);
			
			if (newVariableCell) {
                newVariableCell.node.querySelector('.BMLayoutEditorVariableName').focus();
                
                this.collectionView.scrollToCellAtIndexPath(newVariableIndexPath, {animated: YES});
			}
			else {
				// If the newly created property is not in view, its cell must be created before it can be focused
				newVariableCell = this.collectionView.retainCellForIndexPath(newVariableIndexPath);
				newVariableCell.node.querySelector('.BMLayoutEditorVariableName').focus();
				
				// Because any input acquiring focus will cause its owning cell to be retained, the cell may be released from here
				newVariableCell.release();
                
                this.collectionView.scrollToCellAtIndexPath(newVariableIndexPath, {animated: YES});
			}
        });
    }

    collectionViewCanSelectCellAtIndexPath() {
        return NO;
    }

    collectionViewSizeForCellAtIndexPath(collectionView, indexPath) {
        if (!indexPath.object.sizeClass) {
            return BMSizeMake(1, 48);
        }
        else {
            return BMSizeMake(1, 32);
        }
    }

}

// @endtype