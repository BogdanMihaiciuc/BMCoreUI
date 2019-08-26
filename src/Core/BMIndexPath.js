// @ts-check

import {YES, NO} from './BMCoreUI'

// @type BMIndexPath<T = any>

/*
****************************************************************************************************************************************************************
																		BMIndexPath
****************************************************************************************************************************************************************
*/

/**
 * A BMIndexPath object manages the mapping between an object and its position within a data set.
 * It represents an ordered list of indexes that should be traversed within a data set to reach a given object.
 * 
 * Optionally, and index path may also contain a reference to the object to which its indexes point.
 * 
 * Index paths should be created using one of the `BMIndexPathMake` functions rather than using the constructor.
 */
export function BMIndexPath() {} // <constructor>

BMIndexPath.prototype = {
    /**
     * The object.
     */
    object: undefined, // <T, nullable>

    /**
     * The ordered list of indexes.
     */
	indexes: undefined, // <[Int]>
	
	/**
	 * Initializes this index path by copying the values of the given index path.
	 * @param indexPath <BMIndexPath<T>>			The index path to copy.
	 * @return <BMIndexPath<T>>						This index path.
	 */
	initWithIndexPath(indexPath) {
		this.object = indexPath.object;
		this.indexes = indexPath.indexes.slice();
		return this;
	},

    /**
     * The object's row. This corresponds to the second index.
     */
    get row() { // <Int>
        return this.indexes[1];
    },
    set row(row) {
        this.indexes[1] = row;
    },

    /**
     * The object's section. This corresponds to the first index.
     */
    get section() { // <Int>
        return this.indexes[0];
    },
    set section(section) {
        this.indexes[0] = section;
    },

    /**
     * Creates and returns a new <code>BMIndexPath</code> instance with the same property values
     * as this index path.
     * @return <BMIndexPath<T>>    An index path.
     */
    copy: function () {
        var result = new BMIndexPath();
        result.object = this.object;
        result.indexes = this.indexes.slice();
        return result;
    },
    
    /**
	 * Used to test if two index paths are strictly equal.
	 * Two index paths are strictly equal if the contain the same indexes and point to the same object.
	 * @param indexPath <BMIndexPath, nullable>					The index path. If undefined, this method returns NO.
	 * {
	 *	@param usingComparator <Boolean ^ (Object, Object)>		The comparator used to compare the pointed object.
	 * }
	 * @return <Boolean>										YES if the index paths are strictly equal, NO otherwise.
	 */
    isEqualToIndexPath: function (indexPath, options) {
	    if (!indexPath || indexPath == BMIndexPathNone) return NO;
	    
	    if (indexPath.indexes.length != this.indexes.length) return NO;
	    for (var i = 0; i < this.indexes.length; i++) {
		    if (this.indexes[i] != indexPath.indexes[i]) return NO;
	    }
	    
	    return options.usingComparator(this.object, indexPath.object);
	    
    },
    
    /**
	 * Used to test if two index paths represent the same element, even if they have a different position in the data set.
	 * Two index paths are loosely equal if they refer to the same object or if they both refer to no object but have equal indexes.
	 * @param indexPath <BMIndexPath, nullable>					The index path. If undefined, this method returns NO.
	 * {
	 *	@param usingComparator <Boolean ^ (Object, Object)>		The comparator used to compare the pointed object.
	 * }
	 * @return <Boolean>										YES if the index paths are loosely equal, NO otherwise.
	 */
    isLooselyEqualToIndexPath: function (indexPath, options) {
	    if (!indexPath || indexPath == BMIndexPathNone) return NO;
	    
	    if (indexPath.object === undefined && this.object === undefined) {
		    if (indexPath.indexes.length != this.indexes.length) return NO;
		    for (var i = 0; i < this.indexes.length; i++) {
			    if (this.indexes[i] != indexPath.indexes[i]) return NO;
		    }
		    return YES;
	    }
	    else {
	    	return options.usingComparator(this.object, indexPath.object);
	    }
    }

};

/**
 * An index path that points to no object.
 * This index path will return NO when tested for equality, even against itself.
 */
export var BMIndexPathNone = BMIndexPathMakeWithRow(NaN, {section: NaN, forObject: NaN}); // <BMIndexPath<any>>
BMIndexPathNone.section = NaN;
BMIndexPathNone.isEqualToIndexPath = function () { return NO; };
BMIndexPathNone.isLooselyEqualToIndexPath = function () { return NO; };

/**
 * Constructs and returns a new BMIndexPath object initialized to the given row and section.
 * @param row <Int>                     	The row number.
 * {
 *  @param section <Int, nullable>      	Defaults to 0. The section number.
 *  @param forObject <Object, nullable>		The object.
 * }
 * @return <BMIndexPath>					An index path.
 */
export function BMIndexPathMakeWithRow(row, options) {
    var indexPath = new BMIndexPath();
    indexPath.indexes = [(options && options.section) || 0, row];
    indexPath.object = (options && options.forObject);
    return indexPath;
}


/**
 * Constructs and returns a new BMIndexPath object initialized to the given indexes.
 * @param indexes <[Int]>               		The indexes.
 * {
 *  @param forObject <Object, nullable>         Optional. The object.
 * }
 * @return <BMIndexPath>						An index path.
 */
export function BMIndexPathMakeWithIndexes(indexes, options) {
	var indexPath = new BMIndexPath();
	indexPath.indexes = indexes;
	indexPath.object = options ? options.forObject : undefined;
	return indexPath;
}

// @endtype