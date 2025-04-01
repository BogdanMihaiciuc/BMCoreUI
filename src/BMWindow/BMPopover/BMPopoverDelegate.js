// @type interface BMPopoverDelegate extends BMWindowDelegate

/**
 * The specification for a `BMPopoverDelegate` object, which can optionally be used in conjunction with
 * `BMPopover` objects and will receive various callbacks related to the popover's lifecycle.
 */
function BMPopoverDelegate() {} // <constructor>

BMPopoverDelegate.prototype = {
	
	/**
	 * Invoked when a drag interaction starts to verify if the operation can cause the popover
     * to detach from its anchor and become freely movable.
     * 
     * Delegate objects can optionally implement this method and return `YES` to cause the popover
     * to detach from the anchor and be freely movable.
     * 
     * When this method is not implemented, popovers cannot be detached from their anchor.
	 * @param popover <BMPopover>		The calling popover.
     * @returns <Boolean>               `YES` if the popover should detach, `NO` otherwise.
	 */
	popoverCanDetach(popover) {},
	
	/**
	 * Invoked when a popover has detached from its anchor and any associated animation has finished playing.
	 * @param popover <BMPopover>		The calling popover.
	 */
    popoverDidDetach(popover) {},

};

// @endtype