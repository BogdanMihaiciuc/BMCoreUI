// @ts-check

// @type BMDropSessionActionKind

export const BMDropSessionActionKind = Object.freeze({ // <enum>

    /**
     * Indicates that this drag session is ignored by the drop target and should be treated
     * as if the items are simply dragged out of the source view.
     */
    Ignore: 'Ignore', // <enum>

    /**
     * Indicates that the drop target can normally accept items from the source view but none
     * of the items in the current session are acceptable. Finishing the gesture over the
     * current drop target should cancel the gesture.
     */
    Reject: 'Reject', // <enum>

    /**
     * Indicates that the drop target can accept the items in the drag session, but dropping them
     * will cause the items to be deleted. Requires the source view to specify a `.Move` transfer
     * for this drag session, otherwise the action reverts to `.Reject`.
     */
    Delete: 'Delete', // <enum>

    /**
     * Indicates that the drop target can accept all the items in the drag session.
     */
    Accept: 'Accept', // <enum>

    /**
     * Indicates that the drop target can accept only some of the items in the drag session.
     * Finishing the gesture will cause the unacceptable items to be discarded.
     */
    AcceptPartially: 'AcceptPartially', // <enum>

});

// @endtype

// @type BMDragSessionActionKind

export const BMDragSessionActionKind = Object.freeze({ // <enum>

    /**
     * Indicates that dropping the items at the current location will have no additional effect.
     */
    Ignore: 'Ignore', // <enum>

    /**
     * Indicates that ending the drag session at the current location will cause the items to be
     * deleted.
     */
    Delete: 'Delete', // <enum>

    /**
     * Indicates that dropping the items at the current location would normally cause an effect,
     * but that action cannot currently be performed.
     * Finishing the gesture over the current drop target should cancel the gesture.
     */
    Reject: 'Reject', // <enum>

});

// Controls the association between drop actions and the classes to apply to the drag indicator
export const _BMDragSessionDropActionMap = {
    [BMDragSessionActionKind.Ignore]: 'BMDragSessionIndicatorBlue',
    [BMDragSessionActionKind.Delete]: 'BMDragSessionIndicatorRed',
    [BMDragSessionActionKind.Reject]: 'BMDragSessionIndicatorGray',
    [BMDropSessionActionKind.Accept]: 'BMDragSessionIndicatorGreen',
    [BMDropSessionActionKind.AcceptPartially]: 'BMDragSessionIndicatorYellow',
};

/**
 * A dictionary having drag and drop action kinds as keys and the associated icon URLs as values.
 */
export const _BMDragSessionIconMap = Object.freeze({
    [BMDragSessionActionKind.Reject]: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2220px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2220px%22%20fill%3D%22%23FFFFFF%22%3E%3Cpath%20d%3D%22M480-96q-79%200-149-30t-122.5-82.5Q156-261%20126-331T96-480q0-80%2030-149.5t82.5-122Q261-804%20331-834t149-30q80%200%20149.5%2030t122%2082.5Q804-699%20834-629.5T864-480q0%2079-30%20149t-82.5%20122.5Q699-156%20629.5-126T480-96Zm0-72q55%200%20104-18t89-50L236-673q-32%2040-50%2089t-18%20104q0%20130%2091%20221t221%2091Zm244-119q32-40%2050-89t18-104q0-130-91-221t-221-91q-55%200-104%2018t-89%2050l437%20437Z%22%2F%3E%3C%2Fsvg%3E',
    [BMDragSessionActionKind.Ignore]: '',
    [BMDragSessionActionKind.Delete]: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2220px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2220px%22%20fill%3D%22%23FFFFFF%22%3E%3Cpath%20d%3D%22M312-144q-29.7%200-50.85-21.15Q240-186.3%20240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186%20698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120%200h72v-336h-72v336ZM312-696v480-480Z%22%2F%3E%3C%2Fsvg%3E',
    [BMDropSessionActionKind.Accept]: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2220px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2220px%22%20fill%3D%22%23FFFFFF%22%3E%3Cpath%20d%3D%22M192-96v-72h576v72H192Zm288-144L219-576h141v-288h240v288h141L480-240Zm0-117%20114-147h-66v-288h-96v288h-66l114%20147Zm0-147Z%22%2F%3E%3C%2Fsvg%3E',
    [BMDropSessionActionKind.AcceptPartially]: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2220px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2220px%22%20fill%3D%22%23FFFFFF%22%3E%3Cpath%20d%3D%22M480-96%20216-360l51-51%20177%20177v-630h72v630l177-177%2051%2051L480-96Z%22%2F%3E%3C%2Fsvg%3E',
});

// @endtype

// @type _BMDragDropSessionAction

/**
 * An object that describes the action that should be performed for a drag or drop
 * session when it ends.
 */
export function _BMDragDropSessionAction() {} // <constructor>

_BMDragDropSessionAction.prototype = {

    /**
     * The action to perform at the end of the drag session.
     */
    _action: BMDropSessionActionKind.Ignore, // <BMDragSessionActionKind or BMDropSessionActionKind>

    /**
     * If specified, the message text to display for this outcome.
     */
    _message: undefined, // <String, nullable>

    /**
     * If specified, the message markup to display for this outcome.
     */
    _messageHTML: undefined, // <String, nullable>

    /**
     * If specified when the action is `.AcceptPartially`, the drag items that are actually acceptable.
     * If omitted, the UI will not indicate which items are acceptable.
     */
    _acceptableItems: undefined, // <[BMDragItem], nullable>

}

// @endtype