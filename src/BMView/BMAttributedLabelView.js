import {YES, NO, BMExtend, BMCopyProperties} from '../Core/BMCoreUI'
import {BMView} from './BMView_v2.5'

const BM_LABEL_VIEW_DEBUG_INTRINSIC_SIZE = NO;

// @type BMAttributedLabelView extends BMView

/**
 * An attributed label view is a view that displays a text that can have various arguments which may be changed at runtime.
 * The attributed label automatically generates DOM nodes for each argument.
 * 
 * Creating a label view with a template can be done using the factory method:
 * ```js
BMAttributedView.labelViewWithTemplate('Template with ${firstPlaceholder} and ${secondPlaceholder}');
```
 * which creates an attributed label with two arguments named `firstPlaceholder` and `secondPlaceholder`.
 * 
 * The arguments themselves are accessed and updated via the `arguments` property of the attributed label view. Each argument
 * appears as a property of that object. Their value can be read or written through the `value` property of that object .e.g 
 * ```js
// This sets the value of the firstPlaceholder argument
myLabelView.arguments.firstPlaceholder.value = 3;
```
 *
 * Additionally, the arguments objects allow specifying CSS styles for each argument. The attributed label view will reapply these styles
 * whenever the underlying DOM structure changes, for example when changing the template string. This is accessible via the `style` property of each argument
 * object. This takes a regular CSS rule object, such as `{color: 'red', borderWidth: '2px'}`.
 * 
 * Finally, the underlying DOM nodes themselves are accessible via the `node` property of these arguments objects. Note that there is no guarantee of the lifetime of
 * these DOM nodes. The attribute label can remove and re-create these nodes at any time as needed.
 */
export function BMAttributedLabelView() {} // <constructor>

/**
 * The regex used by the attributed label view to extract arguments
 */
const _BMAttributedLabelViewRegex = /\${([a-zA-Z0-9]+)}/g;

BMAttributedLabelView.prototype = BMExtend(Object.create(BMView.prototype), {

    _supportsAutomaticIntrinsicSize: YES,

    get intrinsicSize() {
        let result = Object.getOwnPropertyDescriptor(BMView.prototype, 'intrinsicSize').get.call(this);

        if (BM_LABEL_VIEW_DEBUG_INTRINSIC_SIZE) console.log('[BMAttributedLabelView] Intrinsic size is ' + result);

        if (BM_LABEL_VIEW_DEBUG_INTRINSIC_SIZE && result && result.width > 1000) debugger;

        return result;
    },

    initWithDOMNode() {
        BMView.prototype.initWithDOMNode.apply(this, arguments);

        this.arguments = {};

        return this;
    },

    /**
     * This attributed label view's content node. If this value is not set during initialization, it defaults to the view's node.
     * 
     * If set, this controls where the attributed label view will insert its text. The given node should be a descendant of the label view's node.
     */
    _contentNode: undefined,
    get contentNode() {
        return this._contentNode || this.node;
    },

    /**
     * An optional string that will be prefixed to the argument DOM node class names.
     * By default, a DOM node is created for each argument and is assigned a class name that is
     * equal to the argument's name. When this property is set, its value is prefixed to the argument's class name.
     */
    _classPrefix: undefined, // <String>
    get classPrefix() {
        return this._classPrefix;
    },
    set classPrefix(classPrefix) {
        classPrefix = classPrefix || '';

        for (let argumentName in this.arguments) {
            let argument = this.arguments[argumentName];
            argument._node.className = classPrefix + argumentName;
        }
    },

    /**
     * The template string.
     */
    _template: undefined, // <String>
    get template() {
        return this._template;
    },
    set template(template) {
        this._template = template;

        // Discover the arguments within the template
        _BMAttributedLabelViewRegex.lastIndex = 0;

        // This object contains the new list of arguments
        let newArguments = {};

        let match;
        let index = 0;
        while (match = _BMAttributedLabelViewRegex.exec(template)) {
            let argumentName = match[1];
            let argument;

            if (this.arguments[argumentName]) {
                // If an argument with this name already exists, update its internal index number to the given value
                argument = this.arguments[argumentName];
                argument._index = index;
                newArguments[argumentName] = argument;
            }
            else {
                // Otherwise create a new argument
                argument = Object.create(BMAttributedLabelViewArgument.prototype);
                argument._name = argumentName;
                argument._index = index;
                argument._view = this;
                newArguments[argumentName] = argument;
            }

            index++;
        }

        // Then replace the arguments within the template with spans
        template = template.replace(_BMAttributedLabelViewRegex, `<span class=${this._classPrefix}$1></span>`);

        this.contentNode.innerHTML = template;

        // Set up the node properties of all of the arguments
        this.arguments = newArguments;
        for (let argumentName in newArguments) {
            let argument = newArguments[argumentName];
            argument._setNode(this._node.querySelectorAll(`.${this._classPrefix + argumentName}`)[0]);
        }

        // Invalidate the intrinsic size upon the template being changed
        this.invalidateIntrinsicSize();

    },

    /**
     * An object that contains the arguments used by this attributed label view.
     * This object's keys and values should not be modified; only the properties label view arguments themselves should be modified.
     */
    arguments: undefined, // <Readonly<Dictionary<BMAttributedLabelViewArgument>>>

});

/**
 * Constructs and returns an attributed label view with the given template.
 * @param template <String>                             The template to use for this label view.
 * @param args <Dictionary<AnyObject>, nullable>        An optional list of initial values to use for the placeholders.
 * @return <BMAttributedLabelView>                      An attributed label view.
 */
BMAttributedLabelView.labelViewWithTemplate = function (template, args) {
    let view = BMView.view.call(BMAttributedLabelView);

    view._classPrefix = '';
    view.template = template;
    for (let argumentName in args) {
        if (view.arguments[argumentName]) {
            view.arguments[argumentName].value = args[argumentName];
        }
    }

    return view;
}

/**
 * Constructs and returns an attributed label view with the given template. The new view will use the given node.
 * @param node <DOMNode>                                The node.
 * {
 *  @param template <String>                            The template to use for this label view.
 *  @param contentNode <DOMNode, nullable>              If set, this should be a descendant of the node property.
 *                                                      This parameter represents the DOM node in which the attributed label view will insert its contents.
 *  @param arguments <Dictionary<AnyObject>, nullable>  An optional list of initial values to use for the placeholders.
 * }
 * @return <BMAttributedLabelView>                      An attributed label view.
 */
BMAttributedLabelView.labelViewForNode = function (node, args) {
    let view = BMView.viewForNode.call(BMAttributedLabelView, node);

    view._contentNode = args.contentNode;
    view._classPrefix = '';
    view.template = args.template;
    for (let argumentName in args.arguments) {
        if (view.arguments[argumentName]) {
            view.arguments[argumentName].value = args.arguments[argumentName];
        }
    }

    return view;
}

// @endtype

// @type BMAttributedLabelViewArgument

/**
 * An attributed label view argument manages the display of an argument of an attributed label view.
 * 
 * Label view arguments cannot be created directly. They are always created and managed by an attributed label view.
 */
export function BMAttributedLabelViewArgument() {} // <constructor>

BMAttributedLabelViewArgument.prototype = {

    /**
     * The attributed label view managing this argument.
     */
    _view: undefined, // <BMAttributedLabelView>

    /**
     * This argument's name.
     */
    _name: undefined, // <String>

    /**
     * Represents this argument's index within the DOM hierarchy.
     */
    _index: undefined, // <Number>

    /**
     * The argument's current value. If this is set to a non-string value, its `toString()` method will be used
     * to obtain a string representation.
     * Changing this value will cause the intrinsic size of the associated label to be invalidated.
     */
    _value: '', // <AnyObject>
    get value() {
        return this._value;
    },
    set value(value) {
        value = (typeof value === 'undefined') ? '' : value;
        if (value != this._value) {
            this._value = value;

            if (this._node) {
                this._node.innerText = value;

                // Invalidate the intrinsic size of the label view upon the value being changed
                this._view.invalidateIntrinsicSize();
            }
        }
    },

    /**
     * An object containing the CSS styles that this argument should use.
     * The object returned by this property should not be modified after being assigned, instead
     * modifications should be performed by creating and setting a new object for this property.
     * Changing this value will cause the intrinsic size of the associated label to be invalidated.
     */
    _style: undefined, // <Readonly<Dictionary<String>>, nullable>
    get style() {
        return this._style;
    },
    set style(style) {
        if (!this._node) {
            this._style = style || {};
            return;
        }

        // If the style is undefined, revert to an empty object
        style = style || {};

        // Clear the previous styles from the node; this is to prevent older styles from affecting the argument
        // if they don't exist in the new style
        if (this._style) {
            for (let key in this._style) {
                if (!(key in style)) this._node.style.removeProperty(key);
            }
        }

        // Then add the new styles
        this._style = style;
        for (let key in this._style) {
            this._node.style[key] = this._style[key];
        }

        // Invalidate the intrinsic size of the label view upon the style being changed as it can affect layout
        this._view.invalidateIntrinsicSize();
    },

    /**
     * The DOM node managed by this argument.
     */
    _node: undefined, // <DOMNode>
    get node() {
        return this._node;
    },

    /**
     * Used internally by CoreUI to assign a node to this argument.
     * @param node <DOMNode>            The node.
     */
    _setNode: function (node) {
        this._node = node;

        // Set up the value and styles
        node.innerText = this._value;
        BMCopyProperties(node.style, this._style || {});
    }

}

// @endtype