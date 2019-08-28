//@ts-check
const fs = require('fs');

let JSDocRegex = /\/\*\*\s*\n([\S\s]*?)\*\/\n([\s\S]*?)\n/gm;

let paramRegex = /\s*@param ([^<>]*) <(.*?)>\s*(.*)/;
let returnRegex = /\s*@return <(.*?)>\s*(.*)/;

//let functionPropertyRegex = /\s*(.*?)\s*:\s*(async)?\s*function.*?\(.*?\)|^\s*(?!get|set|function|async)\s*(\S*?)\s*\(.*?\)\s*{/;  ///\s*(.*?)\s*:\s*function.*?\(.*?\)/;
// This regex should also work with prototype assignments
let functionPropertyRegex = /\s*(.*?)\s*:\s*(async)?\s*function.*?\(.*?\)|^\s*(?!get|set|function|async)\s*(\S*?)\s*\(.*?\)\s*{|\s*(?:.*)\.prototype\.(.*?)\s*=\s*function\s*\(.*\)\s* {/;
let functionVariableRegex = /\s*var\s*(.*?)\s*=\s*function.*?\(.*?\)/;
let globalFunctionRegex = /\s*function\s*(.*?)\s*\(.*?\)/;
let classRegex = /\s*class\s*(\S*?)\s*(extends\s+\S+)?\s*{/;
let staticFunctionRegex = /\s*[^\s\.]*\.((?!\S+\.).*)\s*=\s*(?:async)?\s*function\s*\(.*\)\s* {|\s*[^\s\.]*\.((?!\S+\.).*)\s*=\s*[^;]+;/;

let enumRegex = /\s*var\s*(.*?)\s*=\s*Object\.freeze\({/;
let typedVariableRegex = /\s*var\s*(.*?)\s*=\s*.*?<(.*)>/;
let typedPropertyRegex = /\s*(.*?)\s*:\s*.*?<(.*)>/;
let untypedVariableRegex = /\s*var\s*(.*?)\s*=\s*.*/;
let untypedPropertyRegex = /\s*(.*?)\s*:\s*.*/;
let getterRegex = /\s*get\s+(\S+)\s*\(\s*\)\s*{/;
let typedGetterRegex = /\s*get\s+(\S+)\s*\(\s*\)\s*{\s*\/\/\s*<(.*?)>\s*$/;

/**
 * Finds and returns the first instance of the top-most closing scope in the given string.
 * @param string <String>						    The string.
 * @param {Object} args
 * {
 *	@param {number=} args.fromIndex <Number, nullable>			Defaults to 0. The index from which to start the search.
 *	@param {number=} args.withOpenScopes <Number, nullable>	    Defaults to 0. The number of already open scopes.
 * }
 */
function BMIndexOfClosingScopeInString(string, args) {
    let count = args.withOpenScopes;
    
    for (let i = 0; i < string.length; i++) {
        if (string.charAt(i) == '{') {
            count = (count || 0) + 1;
        }
        else if (string.charAt(i) == '}') {
            count = (count || 0) - 1;
        }
        
        if (count === 0) {
            return i;
        }
    }
}


/**
 * @param contents					    The file contents.
 * @param {Object} args
 * {
 *	@param {boolean=} args.returnOutput     True if the output will be returned, otherwise it will be directly written to a file.
 *	@param {boolean=} args.modules          Whether the definitions file will be a module.
 * }
 */
function allFilesLoaded(contents, {returnOutput = false, modules = false} = {returnOutput: false, modules: false}) {

    let documentation;
    //let contents = xhr.responseText;

    // Split the document by top-level type annotations
    let contentSections = contents.split('// @type');

    let outline = {};

    for (let i = 0; i < contentSections.length; i++) {
        if (contentSections[i].trim().length == 0) {
            contentSections.splice(i, 1);
            i--;

            continue;
        }

        // There may be global symbols not associated with any type
        let section = contentSections[i].split('// @endType\n');
        if (section.length > 2) {
            contentSections.splice(i, 1);
            i--;
            section.forEach(function (text, index, array) {
                if (text.trim().length) {
                    contentSections.splice(i, 0, text);
                    i++;
                }

                if (index == 0) {
                    // Convert the section to an object
                    let typename = text.substring(0, text.indexOf('\n'));
                    let contents = text.substring(typename.length + 1, text.length);

                    contentSections[i] = {typename: typename, contents: contents};
                }
                else {
                    contentSections[i] = {typename: '', contents: text};
                }
            });
        }
        else {
            // Convert the section to an object
            section = section[0].trim() || (section[1] || '').trim();
            let typename = section.substring(0, section.indexOf('\n'));
            let text = section.substring(typename.length + 1, section.length);

            contentSections[i] = {typename: typename, contents: text};
        }
    }

    let pageHTML = '<div class="Documentation">';

    let globals = {};
    
    let linkIDSerial = 0;

    contentSections.forEach(function (section, index, array) {
        let contents = section.contents;

        pageHTML += '<div class="Type"><span class="Typename">' + section.typename + '</span><br/>';

        let outlineSection = {};
        outline[section.typename] = outlineSection;
        
        let typename = section.typename;

        /*

        {
            type: 'class',
            components: [method|property],
            staticComponents: [method|property],
            constructor: method?,
            name: string,
            doc: string,
            isPrivate: BOOL
        },
        {
            type: 'enum',
            components: [constant],
            name: string,
            doc: string
        }

        */

        let exportedClass = {};
        exportedClass.name = section.typename;
        globals[exportedClass.name] = exportedClass;

        while (documentation = JSDocRegex.exec(contents)) {

            let description = documentation[1];
            let body = documentation[2];

            let descriptionLines = description.split('\n');

            let html = '<div class="Description">';
            
            let nextContent = RegExp.rightContext;
            
            let outlineName, outlineKey, outlineType;
            let linkID;

            let exportedItem = {};
            /*

            {
                type: 'method',
                isAsync: BOOL,
                name: string,
                arguments: [{name: string, type: string, nullable: BOOL}],
                argumentsObject: [{name: string, type: string, nullable: BOOL}],
                return: {type: string, nullable: BOOL},
                isPrivate: BOOL,
                isGenerator: BOOL // NOT used,
                doc: string,
                isStatic: BOOL
            },
            {
                type: 'property',
                name: string,
                dataType: string,
                read: BOOL,
                write: BOOL,
                isPrivate: BOOL,
                nullable: BOOL,
                doc: string
            },
            {
                type: 'symbol',
                name: string,
                dataType: string,
                isPrivate: BOOL,
                nullable: BOOL,
                doc: string
            },
            {
                type: 'function',
                isAsync: BOOL,
                name: string,
                arguments: [{name: string, type: string, nullable: BOOL}],
                argumentsObject: [{name: string, type: string, nullable: BOOL}],
                return: {type: string, nullable: BOOL},
                isGenerator: BOOL // NOT used,
                isPrivate: BOOL,
                doc: string
            },
            {
                type: 'constant',
                name: string,
                doc: string
            }

            */

            let match;
            if (match = functionPropertyRegex.exec(body)) {

                let name = match[1] || match[3] || match[4];
                
                linkID =  section.typename + '-' + name + '-' + linkIDSerial;
                exportedItem.name = name;
                
                if (name.indexOf('/*required*/') != -1) {
                    exportedItem.name = name.substring('/*required*/'.length + 1, name.length);
                    name = '<span class="StatementRequired">required</span> ' + name.substring('/*required*/'.length + 1, name.length);
                }
                else {
                    exportedItem.optional = true;
                }
                
                let type = name.charAt(0) == '_' ? 'private method' : 'method';

                if (body.trim().indexOf('async ') != -1) type = 'async ' + type;

                html += '<div class="Statement" id="' + linkID + '">' + name + '<span class="StatementType"> - ' + type + '</span></div>';

                outlineName = name;
                outlineType = type;
                
                exportedClass.type = 'class';
                exportedClass.components = exportedClass.components || [];
                exportedClass.components.push(exportedItem);

                exportedItem.type = 'method';
                exportedItem.isAsync = (body.trim().indexOf('async ') != -1);
                exportedItem.isPrivate = (name.charAt(0) == '_');
                exportedItem.arguments = [];
                exportedItem.argumentsObject = [];
                
                //outlineSection[match[1]] = type;
            }
            else if (match = staticFunctionRegex.exec(body)) {

                let name = match[1] || match[2];
                
                linkID =  section.typename + '-' + name + '-' + linkIDSerial;
                exportedItem.name = name;
                
                if (name.indexOf('/*required*/') != -1) {
                    exportedItem.name = name.substring('/*required*/'.length + 1, name.length);
                    name = '<span class="StatementRequired">required</span> ' + name.substring('/*required*/'.length + 1, name.length);
                }
                else {
                    exportedItem.optional = true;
                }
                
                let type = name.charAt(0) == '_' ? 'private static method' : 'static method';

                if (body.trim().indexOf('async ') != -1) type = 'async ' + type;

                html += '<div class="Statement" id="' + linkID + '">' + name + '<span class="StatementType"> - ' + type + '</span></div>';

                outlineName = name;
                outlineType = type;
                
                exportedClass.type = 'class';
                exportedClass.components = exportedClass.components || [];
                exportedClass.components.push(exportedItem);

                exportedItem.type = 'method';
                exportedItem.isAsync = (body.trim().indexOf('async ') != -1);
                exportedItem.isPrivate = (name.charAt(0) == '_');
                exportedItem.isStatic = true;
                exportedItem.arguments = [];
                exportedItem.argumentsObject = [];
                
                //outlineSection[match[1]] = type;
            }
            else if (match = functionVariableRegex.exec(body)) {
                if (body.indexOf('<constructor') != -1) {
                    let type = match[1].charAt(0) == '_' ? 'private type' : 'type';
                
                    linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                    
                    html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - ' + type + '</span></div>';

                    outlineName = match[1];
                    outlineType = type;
                    let name = outlineName;
                    
                    exportedClass.constructor = exportedItem;
                    exportedClass.type = 'class';

                    exportedItem.type = 'method';
                    exportedItem.isPrivate = (name.charAt(0) == '_');
                    exportedItem.isAsync = false; // Currently global functions aren't async
                    exportedItem.name = match[1]; //?
                    exportedItem.arguments = [];
                    exportedItem.argumentsObject = [];

                    //outlineSection[match[1]] = type;
                }
                else {
                    let type = match[1].charAt(0) == '_' ? 'private function' : 'function';
                
                    linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                
                    html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - ' + type + '</span></div>';

                    outlineName = match[1];
                    let name = outlineName;
                    outlineType = type;

                    exportedItem.type = 'function';
                    exportedItem.isPrivate = (name.charAt(0) == '_');
                    exportedItem.isAsync = false; // Currently global functions aren't async
                    exportedItem.name = match[1];
                    exportedItem.arguments = [];
                    exportedItem.argumentsObject = [];
                    //outlineSection[match[1]] = type;

                    globals[exportedItem.name] = exportedItem;
                }
            }
            else if (match = classRegex.exec(body)) {
                let type = match[1].charAt(0) == '_' ? 'private type' : 'type';
                
                linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                    
                html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - ' + type + '</span></div>';
                
                outlineName = match[1];
                let name = outlineName;
                outlineType = type;
                    
                exportedClass.constructor = exportedItem;
                exportedClass.type = 'class';

                exportedItem.type = 'method';
                exportedItem.isPrivate = (name.charAt(0) == '_');
                exportedItem.isAsync = false; // Classes aren't async
                exportedItem.name = match[1]; //?
                exportedItem.arguments = [];
                exportedItem.argumentsObject = [];
            }
            else if (match = globalFunctionRegex.exec(body)) {
                if (body.indexOf('<constructor') != -1) {
                    let type = match[1].charAt(0) == '_' ? 'private type' : 'type';
                
                    linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                    
                    html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - ' + type + '</span></div>';

                    outlineName = match[1];
                    let name = outlineName;
                    outlineType = type;
                    //outlineSection[match[1]] = type;
                    
                    exportedClass.constructor = exportedItem;
                    exportedClass.type = 'class';

                    exportedItem.type = 'method';
                    exportedItem.isPrivate = (name.charAt(0) == '_');
                    exportedItem.isAsync = false; // Currently global functions aren't async
                    exportedItem.name = match[1]; //?
                    exportedItem.arguments = [];
                    exportedItem.argumentsObject = [];
                }
                else {
                    let type = match[1].charAt(0) == '_' ? 'private function' : 'function';
                
                    linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                
                    html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - ' + type + '</span></div>';

                    outlineName = match[1];
                    let name = outlineName;
                    outlineType = type;
                    //outlineSection[match[1]] = type;

                    exportedItem.type = 'function';
                    exportedItem.isPrivate = (name.charAt(0) == '_');
                    exportedItem.isAsync = false; // Currently global functions aren't async
                    exportedItem.name = match[1];
                    exportedItem.arguments = [];
                    exportedItem.argumentsObject = [];
                    //outlineSection[match[1]] = type;

                    globals[exportedItem.name] = exportedItem;
                }
            }
            else if (match = enumRegex.exec(body)) {
                
                linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                
                html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - enum</span></div>';

                outlineName = match[1];
                outlineType = 'enum';
                //outlineSection[match[1]] = 'enum';

                exportedClass.type = 'enum';
                exportedClass.fields = exportedClass.fields || [];

                exportedItem.type = 'constant';
                exportedItem.name = match[1];
                
                exportedClass.fields.push(exportedItem);

            }
            else if (match = typedVariableRegex.exec(body)) {
                
                // Figure out if this type has a nullability annotation
                let nullabilityType;
                let type = match[2];
                if (type.endsWith(', nullable')) {
                    nullabilityType = 'nullable';
                    type = type.substring(0, type.lastIndexOf(', nullable'));
                }
                else if (type.endsWith(', nullResettable')) {
                    nullabilityType = 'null resettable';
                    type = type.substring(0, type.lastIndexOf(', nullResettable'));
                }
                
                linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                
                html += '<div class="Statement" id="' + linkID + '">' + match[1] + 
                        ': <span class="StatementDataType">' + 
                            (nullabilityType ? '<span class="ParameterNullability">' + nullabilityType + ' </span>' : '') + 
                        type + '</span><span class="StatementType"> - symbol</span></div>';

                outlineName = match[1];
                outlineType = type;
                
                exportedItem.type = 'symbol';
                exportedItem.isPrivate = (outlineName.indexOf('_') == 0);
                exportedItem.dataType = type;
                exportedItem.name = outlineName;
                exportedItem.nullable = (nullabilityType == 'nullable');

                globals[outlineName] = exportedItem;

                //outlineSection[match[1]] = 'symbol';
            }
            else if (match = typedPropertyRegex.exec(body)) {
                
                // Figure out if this property has a nullability annotation
                let nullabilityType;
                let type = match[2];
                if (type.endsWith(', nullable')) {
                    nullabilityType = 'nullable';
                    type = type.substring(0, type.lastIndexOf(', nullable'));
                }
                else if (type.endsWith(', nullResettable')) {
                    nullabilityType = 'null resettable';
                    type = type.substring(0, type.lastIndexOf(', nullResettable'));
                }
                
                exportedItem.type = 'property';
                exportedItem.nullable = (nullabilityType == 'nullable');
                exportedItem.read = true;
                exportedItem.write = true;

                exportedClass.type = 'class';
                exportedClass.components = exportedClass.components || [];
                exportedClass.components.push(exportedItem);
                
                // Properties beginning with underscored names are either private, or storage back-ends for getters and setters
                let propertyName = match[1];
                let publicPropertyName = propertyName;
                let isPrivate = false;
                let isReadonly = false;
                let isWriteonly = false;
                if (propertyName.indexOf('_') == 0) {
                    // Assume that the underscore-prefixed is private at first
                    isPrivate = true;
                    exportedItem.isPrivate = isPrivate;
                    publicPropertyName = propertyName.substring(1, propertyName.length);
                    
                    let lineEnd = nextContent.indexOf('\n');
                    let nextLineEnd = nextContent.indexOf(lineEnd + 1);
                    
                    // Get the next line to see if it starts with a getter or setter, skipping empty lines
                    let nextLine;
                    do {
                        nextLine = nextContent.substring(lineEnd + 1, nextLineEnd).trim();
                        
                        if (!nextLine) {
                            lineEnd = nextLineEnd;
                            nextLineEnd = nextContent.indexOf('\n', lineEnd + 1);
                        }
                        
                    } while (!nextLine && nextLineEnd != -1);
                    
                    // In collection view, all storage backed properties define their getters first and setters afterwards.
                    if (nextLine) {
                        if (nextLine.indexOf('get ' + publicPropertyName) == 0) {
                            // This property has a getter at least, so it's public and possibly readonly
                            isPrivate = false;
                            isReadonly = true;
                            
                            exportedItem.isPrivate = false;
                            exportedItem.read = true;
                            exportedItem.write = false;
                            
                            // Properties that first define getters might also have setters, in which case they will be full read/write public properties
                            let getterEnd = BMIndexOfClosingScopeInString(nextContent, {fromIndex: lineEnd});
                            
                            // Technically, this should always be true for correctly formatted documents
                            if (getterEnd != -1) {
                                // Get the end of the getter line
                                getterEnd = nextContent.indexOf('\n', getterEnd);
                                
                                // Find the end of the next setter line
                                let setterLineEnd = nextContent.indexOf('\n', getterEnd + 1);
                                
                                let setterLine;
                                // Skip empty lines, like before
                                do {
                                    setterLine = nextContent.substring(getterEnd + 1, setterLineEnd).trim();
                                    
                                    if (!setterLine) {
                                        getterEnd = setterLineEnd;
                                        setterLineEnd = nextContent.indexOf('\n', getterEnd + 1);
                                    }
                                } while (!setterLine && setterLineEnd != -1);
                                
                                if (setterLine.indexOf('set ' + publicPropertyName) == 0) {
                                    // This property also has a setter, so it's fully public and read/write
                                    isReadonly = false;
                                    exportedItem.write = true;
                                }
                            }
                            
                        }
                        else if (nextLine.indexOf('set ' + publicPropertyName) == 0) {
                            // This property only has a setter; it is a public writeonly property
                            isPrivate = false;
                            isWriteonly = true;
                            
                            exportedItem.private = false;

                            if (!isReadonly) {
                                exportedItem.write = true;
                                exportedItem.read = false;
                            }
                        }
                    }
                }
                
                // Private properties should retain their underscore-prefixed names
                if (isPrivate) {
                    publicPropertyName = match[1];
                }
                
                let visibilityQualifier = isPrivate ? 'private ' : '';
                let accessQualifier = isReadonly ? 'readonly ' : (isWriteonly ? 'writeonly ' : '');
                
                linkID =  section.typename + '-' + publicPropertyName + '-' + linkIDSerial;
                
                html += '<div class="Statement" id="' + linkID + '">' + publicPropertyName + 
                        ': <span class="StatementDataType">' + 
                            (nullabilityType ? '<span class="ParameterNullability">' + nullabilityType + ' </span>' : '') + 
                        type + '</span><span class="StatementType"> - ' + visibilityQualifier + accessQualifier + 'property</span></div>';

                outlineName = publicPropertyName;
                outlineType = visibilityQualifier + accessQualifier + 'property';
                
                exportedItem.name = publicPropertyName;
                exportedItem.dataType = type;

                if (type == 'enum') exportedClass.type = 'enum';

                //outlineSection[publicPropertyName] = visibilityQualifier + accessQualifier + 'property';
            }
            else if (match = untypedVariableRegex.exec(body)) {
                
                linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                
                html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - symbol</span></div>';

                outlineName = match[1];
                outlineType = 'symbol';

                exportedItem.type = 'symbol';
                exportedItem.isPrivate = (outlineName.indexOf('_') == 0);
                exportedItem.dataType = 'any';
                exportedItem.name = outlineName;
                exportedItem.nullable = false;
                
                globals[outlineName] = exportedItem;

                //outlineSection[match[1]] = 'symbol';
            }
            else if (match = untypedPropertyRegex.exec(body)) {
                
                linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                
                html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - property</span></div>';

                outlineName = match[1];
                outlineType = 'property';
                
                exportedItem.type = 'property';
                exportedItem.isPrivate = (outlineName.indexOf('_') == 0);
                exportedItem.dataType = 'any';
                exportedItem.name = outlineName;
                exportedItem.nullable = false;

                exportedClass.type = 'class';
                exportedClass.components = exportedClass.components || [];
                exportedClass.components.push(exportedItem);

                //outlineSection[match[1]] = 'property';
            }
            else if (match = typedGetterRegex.exec(body)) {
                
                linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                
                // Getter-first properties may either be readonly properties or dynamic properties with an associated setter
                // Try to find the setter to figure out if this property is dynamic or readonly
                // Properties beginning with underscored names are either private, or storage back-ends for getters and setters
                let propertyName = match[1];
                let publicPropertyName = propertyName;
                let isReadonly = true;
                
                exportedItem.type = 'property';
                exportedItem.read = true;
                exportedItem.write = false;
                exportedItem.name = propertyName;

                exportedClass.type = 'class';
                exportedClass.components = exportedClass.components || [];
                exportedClass.components.push(exportedItem);
                    
                    
                let lineEnd = nextContent.indexOf('\n');
                // The end of the getter line will always have an opening brace in well-formatted documents
                let getterEnd = BMIndexOfClosingScopeInString(nextContent, {fromIndex: lineEnd, withOpenScopes: 1});
                
                // Technically, this should always be true for correctly formatted documents
                if (getterEnd != -1) {
                    // Get the end of the getter line
                    getterEnd = nextContent.indexOf('\n', getterEnd);
                    
                    // Find the end of the next setter line
                    let setterLineEnd = nextContent.indexOf('\n', getterEnd + 1);
                    
                    let setterLine;
                    // Skip empty lines, like before
                    do {
                        setterLine = nextContent.substring(getterEnd + 1, setterLineEnd).trim();
                        
                        if (!setterLine) {
                            getterEnd = setterLineEnd;
                            setterLineEnd = nextContent.indexOf('\n', getterEnd + 1);
                        }
                    } while (!setterLine && setterLineEnd != -1);
                    
                    if (setterLine.indexOf('set ' + publicPropertyName) == 0) {
                        // This property also has a setter, so it's fully public and read/write
                        isReadonly = false;
                        exportedItem.write = true;
                    }
                }
                
                // Figure out if this property has a nullability annotation
                let nullabilityType;
                let type = match[2];
                if (type.endsWith(', nullable')) {
                    nullabilityType = 'nullable';
                    type = type.substring(0, type.lastIndexOf(', nullable'));
                }
                else if (type.endsWith(', nullResettable')) {
                    nullabilityType = 'null resettable';
                    type = type.substring(0, type.lastIndexOf(', nullResettable'));
                }
                
                exportedItem.nullable = (nullabilityType == 'nullable');
                exportedItem.dataType = type;
                
                let readonlyIdentifier = isReadonly ? 'readonly ' : '';
                
                html += '<div class="Statement" id="' + linkID + '">' + match[1] + 
                        ': <span class="StatementDataType">' + 
                            (nullabilityType ? '<span class="ParameterNullability">' + nullabilityType + ' </span>' : '') + 
                        type + '<span class="StatementType"> - ' + readonlyIdentifier + 'property</span></div>';

                outlineName = match[1];
                outlineType = readonlyIdentifier + 'property';
                //outlineSection[match[1]] = 'readonly property';
            }
            else if (match = getterRegex.exec(body)) {
                
                linkID =  section.typename + '-' + match[1] + '-' + linkIDSerial;
                
                // Getter-first properties may either be readonly properties or dynamic properties with an associated setter
                // Try to find the setter to figure out if this property is dynamic or readonly
                // Properties beginning with underscored names are either private, or storage back-ends for getters and setters
                let propertyName = match[1];
                let publicPropertyName = propertyName;
                let isReadonly = true;
                
                exportedItem.type = 'property';
                exportedItem.read = true;
                exportedItem.write = false;
                exportedItem.name = propertyName;
                exportedItem.dataType = 'any';
                exportedItem.nullable = false;

                exportedClass.type = 'class';
                exportedClass.components = exportedClass.components || [];
                exportedClass.components.push(exportedItem);
                    
                    
                let lineEnd = nextContent.indexOf('\n');
                // The end of the getter line will always have an opening brace in well-formatted documents
                let getterEnd = BMIndexOfClosingScopeInString(nextContent, {fromIndex: lineEnd, withOpenScopes: 1});
                
                // Technically, this should always be true for correctly formatted documents
                if (getterEnd != -1) {
                    // Get the end of the getter line
                    getterEnd = nextContent.indexOf('\n', getterEnd);
                    
                    // Find the end of the next setter line
                    let setterLineEnd = nextContent.indexOf('\n', getterEnd + 1);
                    
                    let setterLine;
                    // Skip empty lines, like before
                    do {
                        setterLine = nextContent.substring(getterEnd + 1, setterLineEnd).trim();
                        
                        if (!setterLine) {
                            getterEnd = setterLineEnd;
                            setterLineEnd = nextContent.indexOf('\n', getterEnd + 1);
                        }
                    } while (!setterLine && setterLineEnd != -1);
                    
                    if (setterLine.indexOf('set ' + publicPropertyName) == 0) {
                        // This property also has a setter, so it's fully public and read/write
                        isReadonly = false;
                        exportedItem.write = true;
                    }
                }
                
                let readonlyIdentifier = isReadonly ? 'readonly ' : '';
                
                html += '<div class="Statement" id="' + linkID + '">' + match[1] + '<span class="StatementType"> - ' + readonlyIdentifier + 'property</span></div>';

                outlineName = match[1];
                outlineType = readonlyIdentifier + 'property';
                //outlineSection[match[1]] = 'readonly property';
            }
            else {
                
                linkID =  section.typename + '-' + body + '-' + linkIDSerial;
                
                html += '<div class="Statement" id="' + linkID + '">' + body + '</div>';

                outlineName = body;
                outlineType = 'symbol';
                //outlineSection[body] = 'symbol';

                // Include statements in d.ts?
            }
            
            outlineKey = linkID;
            outlineSection[outlineKey] = {
                name: outlineName,
                type: outlineType,
                linkID: outlineKey
            };
            
            linkIDSerial++;

            let isParameter = false;
            let isExplanation = true;

            html += '<div class="DescriptionBody">';
            
            let isFirstParameter = true;

            exportedItem.doc = '/**\n';

            let argumentsObject = false;

            function parameterComponents(line) {
                let matchedName = line.substring('@param '.length, line.length).trim();
                matchedName = matchedName.substring(0, matchedName.indexOf('<')).trim();

                let firstAngleBracket = line.indexOf('<');
                let i = 0;
                let angles = 0;
                for (i = firstAngleBracket; i < line.length; i++) {
                    if (line.charAt(i) == '<') angles++;
                    if (line.charAt(i) == '>') angles--;

                    if (angles == 0) break;
                }

                let type = line.substring(firstAngleBracket + 1, i);
                let description = line.substring(i + 1, line.length);

                return [undefined, matchedName, type, description];
            }

            function returnComponents(line) {
                let firstAngleBracket = line.indexOf('<');
                let i = 0;
                let angles = 0;
                for (i = firstAngleBracket; i < line.length; i++) {
                    if (line.charAt(i) == '<') angles++;
                    if (line.charAt(i) == '>') angles--;

                    if (angles == 0) break;
                }

                let type = line.substring(firstAngleBracket + 1, i);
                let description = line.substring(i + 1, line.length);

                return [undefined, type, description];
            }
            
            descriptionLines.forEach(function (line, index, array) {
                // Convert spaces and tabs to non-breaking spaces
                line = line.substring(line.indexOf('*') + 2, line.length);

                if (line.indexOf('@param') != -1) {
                    if (isExplanation) {
                        isExplanation = false;
                        html += '</div>';
                    }

                    if (isParameter) {
                        html += '</div></div>'
                    }

                    html += '<div class="Parameter' + (isFirstParameter ? ' FirstParameter' : '') + '">';
                    
                    isFirstParameter = false;

                    /** @type {Object} */ let paramComponents = paramRegex.exec(line);

                    paramComponents = parameterComponents(line);

                    // Check to see if the parameter has a nullability annotation
                    let nullabilityType;
                    let type = paramComponents[2];
                    if (type && type.indexOf('<') != -1) {
                        type = type.replace(/\</g,"&lt;").replace(/\>/g,"&gt;");
                    }
                    if (paramComponents[2].endsWith(', nullable')) {
                        nullabilityType = 'nullable';
                        type = type.substring(0, type.lastIndexOf(', nullable'));
                    }
                    else if (paramComponents[2].endsWith(', nullResettable')) {
                        nullabilityType = 'null resettable';
                        type = type.substring(0, type.lastIndexOf(', nullResettable'));
                    }

                    html += '<div class="ParameterName">' + paramComponents[1] +  '</div>';
                    html += '<div class="ParameterType">' +
                                (nullabilityType ? '<span class="ParameterNullability">' + nullabilityType + ' </span>' : '') + 
                            type + '</div>';
                    html += '<div class="ParameterDescription">' + paramComponents[3];

                    isParameter = true;

                    exportedItem.doc += ` * @param ` + paramComponents[1] + ' ' + paramComponents[3] + '\n';

                    if (exportedItem.arguments) {
                        exportedItem[argumentsObject ? 'argumentsObject' : 'arguments'].push({name: paramComponents[1], dataType: type, nullable: (nullabilityType == 'nullable')})
                    }

                }
                else if (line.indexOf('@return') != -1) {
                    if (isExplanation) {
                        isExplanation = false;
                        html += '</div>';
                    }

                    if (isParameter) {
                        html += '</div></div>'
                    }

                    html += '<div class="Parameter Return">';

                    /** @type {Object} */ let paramComponents = returnRegex.exec(line);
                    paramComponents = returnComponents(line);

                    // Check to see if the return value has a nullability annotation
                    let nullabilityType;
                    let type = paramComponents[1];
                    if (paramComponents[1].endsWith(', nullable')) {
                        nullabilityType = 'nullable';
                        type = type.substring(0, type.lastIndexOf(', nullable'));
                    }
                    else if (paramComponents[2].endsWith(', nullResettable')) {
                        nullabilityType = 'null resettable';
                        type = type.substring(0, type.lastIndexOf(', nullResettable'));
                    }

                    html += '<div class="ParameterName ReturnValue">return value</div>';
                    html += '<div class="ParameterType">' +
                                (nullabilityType ? '<span class="ParameterNullability">' + nullabilityType + ' </span>' : '') + 
                            type + '</div>';
                    html += '<div class="ParameterDescription">' + paramComponents[2];

                    isParameter = true;

                    exportedItem.doc += ' * @return ' + paramComponents[2] + '\n';
                    exportedItem.return = {dataType: type, nullable: nullabilityType == 'nullable'};

                }
                else if (line == '{') {

                    if (isParameter) {
                        html += '</div></div>';
                        isParameter = false;
                    }

                    html += '<div class="ArgumentsObject">';
                    argumentsObject = true;

                    //exportedItem.doc += ' * @param args Additional arguments.\n';
                }
                else if (line == '}') {

                    if (isParameter) {
                        html += '</div></div>';
                        isParameter = false;
                    }

                    html += "</div>";
                }
                else {
                    html += line + '<br/>';
                    exportedItem.doc += ' * ' + line + '\n';
                }
            });

            exportedItem.doc += ' */';

            if (isParameter) {
                html += '</div></div>';
            }

            if (isExplanation) {
                html += '</div>';
            }

            html += '</div>'

            pageHTML += html;
        }

        pageHTML += '</div>';

    });

    pageHTML += '</div><div class="Outline">';

    for (let key in outline) {
        
        let html = '<div class="OutlineType"><div class="OutlineTypeName">' + key + '</div>';

        let outlineSection = outline[key];
        for (let prop in outlineSection) {
            let symbol = outlineSection[prop];
            html += '<div class="OutlineProperty" data-link-id="' + prop + '">' + symbol.name + ': <span class="OutlinePropertyType">' + symbol.type + '</span></div>';
        }

        html += '</div>'

        pageHTML += html;
    }

    pageHTML += '</div>';
    
    pageHTML += '<div class="OutlineDragHandle"></div>';

    if (returnOutput) {
        return DTSWithContents(globals, {modules});
    }

    return fs.writeFileSync('BMCoreUI.d.ts', DTSWithContents(globals), 'utf8');

    let pre = document.createElement('pre');
    pre.innerText = DTSWithContents(globals);

    return document.body.appendChild(pre);

    return document.body.innerText = DTSWithContents(globals);

    document.body.innerHTML += pageHTML;
    
    document.querySelectorAll('.OutlineProperty').forEach(function (element, index, array) {
        element.addEventListener('click', function (event) {
            let linkID = element.getAttribute('data-link-id');
            document.location.hash = linkID;	
        });
    });

};

/**
    * Returns the corresponding TypeScript type of the given CoreUI entity.
    * @param entity <Object, nullable>             The CoreUI entity.
    * @param {boolean=} nullable <Boolean, nullable>          Defaults to NO. If set to YES, nullable types will be converted to union types.
    * @return <String>                             The TypeScript type, or 'void' if the entity is undefined.
    */
function typeScriptTypeOfEntity(entity, nullable) {
    if (!entity) return 'void';

    let type = entity.dataType || 'any';

    // Enum types are converted to any
    if (type == 'enum') type = 'any';

    // Multiple Types and AnyObject are converted to any
    if (type == 'Multiple Types') type = 'any';

    // Literal types are converted to their class types
    /*if (type.indexOf(' or ') != -1) {
        type = type.substring(0, type.indexOf(' or '));
    }*/  

    // Or is replaced by pipe
    type = type.replace(/ or /g, ' | ');

    // Boxed types are replaced with primitive types
    // CoreUI typically uses primitives, but declares their types
    // with capitalized names, whereas typescript uses lower case types
    // for primitives
    type = type.replace(/AnyObject/g, 'any');
    type = type.replace(/Number/g, 'number');
    type = type.replace(/String/g, 'string');
    type = type.replace(/Boolean/g, 'boolean');
    type = type.replace(/Void/g, 'void');
    // HTML encoded generics are converted back to angle brackets
    type = type.replace(/\&gt\;/g, '>');
    type = type.replace(/\&lt\;/g, '<');

    // Object generics are converted to dictionary
    type = type.replace(/Object\<string\,/g, 'Dictionary<');  

    // Typeless objects are converted to any
    type = type.replace(/Object/g, 'any');

    // Class extends is replaced by Typeof
    type = type.replace(/Class extends/g, 'typeof');

    // Nullability is replaced with TypeScript nullabilty
    if (type.indexOf('nullable ') == 0) {
        type = type.substring('nullable '.length, type.length) + '?';
    }

    // NullResettability is ignored
    if (type.indexOf('nullResettable ') == 0) {
        type = type.substring('nullResettable '.length, type.length);
    }

    // Array types are converted recursively
    if (type.charAt(0) == '[' && type.charAt(type.length - 1) == ']') {
        let innerType = typeScriptTypeOfEntity({dataType: type.substring(1, type.length - 1)});
        
        return innerType + '[]' + (entity.nullable ? '?' : '');
    }

    // Block types are converted to TypeScript notation
    if (type.indexOf('^') != -1) {
        // In CoreUI, the block pointer may optionally be enclosed in brackets
        let pointer = '^';
        if (type.indexOf('(^)') != -1) {
            pointer = '(^)';
        }

        let returnType = type.substring(0, type.indexOf(pointer) - 1).trim();

        // Get the arguments list sans brackets
        let args = type.substring(type.indexOf(pointer) + pointer.length, type.indexOf(pointer) + pointer.length + type.length).trim();
        args = args.substring(1, args.length - 1);

        //let argsType = args.split(',').map((arg, i) => {name: '_' + i, typeScriptTypeOfEntity({dataType: arg.trim()})}).join(', ');
        let argsType = args.trim() ? args.split(',').map((arg, i) => `$${i}: ` + typeScriptTypeOfEntity({dataType: arg.trim()})).join(', ') : '';

        return '((' + argsType + ') => ' + typeScriptTypeOfEntity(returnType ? {dataType: returnType} : undefined) + ')' + (entity.nullable ? '?' : '');
    }

    if (type.startsWith('Dictionary<') && type.charAt(type.length - 1) != '>') {
        console.warn("Invalid type! " + type + " ---- " + entity.dataType);
    }

    return type + (entity.nullable ? '?' : '');
}

function typeScriptArgNameWithEntity(e) {
    let type = typeScriptTypeOfEntity(e);

    return (e.name + (type.charAt(type.length - 1) == '?' ? '?' : '')).replace('...', '...args').replace('...args?', '...args');
}

function typeScriptDestructuringArgNameWithObjectEntity(e) {
    return e.name.replace('...', '[prop: string]');
}

function typeScriptArgNameWithArgObjectEntity(e) {
    let type = typeScriptTypeOfEntity(e);

    return (e.name + (type.charAt(type.length - 1) == '?' ? '?' : '')).replace('...?', '[prop: string]').replace('...', '[prop: string]');
}

/**
    * Returns the corresponding TypeScript argument name from the given CoreUI argument name.
    * If the argument name is a CoreUI vararg name, the result will be converted into a compatible TypeScript notation.
    * Otherwise the notation is not affected.
    * @param name <String>             The name.
    * @return <String>                 The TypeScript name.
    */
function typeScriptArgNameWithArgName(name) {
    return name == '...' ? '...args' : name;
}

/**
    * Returns the corresponding TypeScript argument name from the given CoreUI argument name.
    * If the argument name is a CoreUI vararg name, the result will be converted into a compatible TypeScript notation.
    * Otherwise the notation is not affected.
    * @param name <String>             The name.
    * @return <String>                 The TypeScript name.
    */
function typeScriptArgNameWithArgObjectName(name) {
    return name == '...' ? '[prop: string]' : name;
}

function typeScriptDocumentationWithDocumentation(documentation) {
    if (!documentation) return '';

    documentation = documentation.replace(/<code>/g, '\`').replace(/<\/code>/g, '\`');
    documentation = documentation.replace(/<b>/g, '__').replace(/<\/b>/g, '__');
    documentation = documentation.replace(/<ul>/g, '\n *').replace(/<\/ul>/g, '\n *');
    documentation = documentation.replace(/<li>(.*)<\/li>/g, (match, item) => ' * ' + item);
    documentation = documentation.replace(/<li>(.*)/g, (match, item) => ' * ' + item);
    documentation = documentation.replace(/(.*)<\/li>/g, (match, item) => item);

    return documentation;
}

/**
 * @param globals					    The file contents.
 * @param {Object} args
 * {
 *	@param {boolean=} args.modules          Whether the definitions file will be a module.
 * }
 */
function DTSWithContents(globals, {modules = false} = {modules: false}) {
    let dts = '';

    dts += `
type Int = number;
type Integer = number;
type Float = number;
type Short = number;
type DOMNode = HTMLElement;
declare interface JQuery {}
type $ = JQuery;

declare interface JQueryEventObject {}
type $event = JQueryEventObject;

declare interface iScroll {}
declare interface Monaco {}
declare interface CodeMirror {}

declare namespace kiwi {
    interface Variable {}
    interface Expression {}
    interface Solver {}
    interface Constant {}
    interface Constraint {}
}

type BMCollectionViewUpdate = never;
type TimeoutToken = number;

${modules ? 'export ' : ''}const YES = true;
${modules ? 'export ' : ''}const NO = false;
                
            `;

    dts += `

/**
 * An interface representing an object whose key values are constrained to a generic type.
 */
${modules ? 'export' : 'declare'} interface Dictionary<V> {
    [key: string]: V;
}


/**
 * An interface implemented by classes that support copying.
 * Most CoreUI primitives implement this interface.
 */
${modules ? 'export' : 'declare'} interface BMCopying {
    /**
     * Returns a copy of this object. Only the properties
     * defined in the prototype will be present in the returned object,
     * and no other properties that may have been added after the object was created.
     * Additionally, properties that represent internal state will not be copied
     * over to the new instance.
     */
    copy(): ThisType<BMCopying>;
}

/**
 * An interface implemented by classes that support interpolation.
 * Most CoreUI primitives implement this interface.
 * Animatable types must also support copying.
 */
${modules ? 'export' : 'declare'} interface BMAnimating extends BMCopying {
    /**
     * Invoked by the CoreUI animation engine to obtain an interpolated
     * value between this object and the target object.
     * @param fraction          The animation fraction.
     * @param toValue           The object to which to interpolate. This must be of the same
     *                          type as the caller.
     */
    interpolatedValueWithFraction(fraction: number, {toValue}: {toValue: ThisType<BMAnimating>}): ThisType<BMAnimating>;
}

    `;

    const declarePrefix = modules ? 'export ' : 'declare ';

    for (let key in globals) {

        var entity = globals[key];

        dts += '\n\n';

        // Globals are one of either class, enum, symbol or function

        if (entity.doc) entity.doc = typeScriptDocumentationWithDocumentation(entity.doc);

        if (entity.type == 'symbol') {
            dts += entity.doc + '\n';
            dts += declarePrefix + (entity.isReadonly ? 'const ' : 'var ') + entity.name + ': ' + typeScriptTypeOfEntity(entity).replace(/\?/g, ' | null | undefined') + ';\n\n';
        }
        else if (entity.type == 'function') {
            dts += typeScriptDocumentationWithDocumentation(entity.doc) + '\n';
            dts += declarePrefix + 'function ' + entity.name + '(';

            // Some methods have the first parameter "optional" but the rest required of which TypeScript complains;
            // In CoreUI this means that the "optional" parameter may be given a value of undefined which may have
            // special semantics; in these cases, the optional marker is removed from the first parameter but the
            // type retains its union with null and undefiend
            let isParametersObjectNullable = true;
            if (entity.argumentsObject.length) {
                isParametersObjectNullable = entity.argumentsObject.reduce((acc, val) => acc && val.nullable, true);
            }

            if (entity.arguments.length) dts += entity.arguments.map((arg) => {
                let name = typeScriptArgNameWithEntity(arg);
                if (!isParametersObjectNullable) {
                    name = name.replace(/\?/g, '');
                }
                // Rest parameters cannot be nullable
                if (name.startsWith('...')) {
                    name = name.replace(/\?/g, '');
                }
                return name + ': ' + typeScriptTypeOfEntity(arg).replace(/\?/g, ' | null | undefined');
            }).join(', ');

            /*if (entity.arguments.length) dts += entity.arguments.map((arg) => {
                return typeScriptArgNameWithEntity(arg) + ': ' + typeScriptTypeOfEntity(arg).replace(/\?/g, ' | null | undefined');
            }).join(', ');*/

            if (entity.argumentsObject.length) {
                dts += ', {' + entity.argumentsObject.filter((arg) => arg.name != '...').map((arg) => `${arg.name}: ${arg.name}`).join(', ') + '}';

                dts += entity.argumentsObject.reduce((acc, val) => acc && val.nullable, true) ? '?' : '';

                dts += ': {';

                dts += entity.argumentsObject.map(arg => typeScriptArgNameWithArgObjectEntity(arg) + ': ' + typeScriptTypeOfEntity(arg).replace(/\?/g, ' | null | undefined')).join(', ') + '}';
            }

            dts += '): ' + typeScriptTypeOfEntity(entity.return).replace(/\?/g, ' | null | undefined') + ';\n\n';
        }
        else if (entity.type == 'enum') {
            if (entity.fields && entity.fields.length) dts += typeScriptDocumentationWithDocumentation(entity.fields[0].doc) + '\n';

            dts += declarePrefix + 'class ' + entity.name + ' {\n';

            dts += entity.components.map((component) => {
                return '\t' + component.doc.split('\n').join('\n\t') + '\n\t' + 'static ' + component.name + ': ' + entity.name + ';\n';
            }).join('\n');

            dts += '\n\tprivate constructor(); \n';

            dts += '}';
        }
        else if (entity.type == 'class') {
            if (entity.constructor && entity.constructor.doc) {
                dts += typeScriptDocumentationWithDocumentation(entity.constructor.doc) + '\n';
            }

            let type = 'class';
            let isInterface = false;
            if (entity.name.indexOf('interface ') == 0) {
                type = 'interface';
                isInterface = true;
                entity.name = entity.name.substring('interface '.length, entity.name.length).trim();
            }
            
            dts += declarePrefix + type + ' ' + entity.name + ' {\n';

            for (let component of entity.components || []) {
                // Interface declaration are often commented out as they don't generate any javascript; strip out the leading comments
                // from these component's names
                if (component.name.startsWith('// ')) {
                    component.name = component.name.substring(3, component.name.length);
                }

                if (component.type == 'property') {

                    dts +=  '\n\t' + typeScriptDocumentationWithDocumentation(component.doc).split('\n').join('\n\t') + '\n\t';

                    dts += component.isPrivate ? 'private ' : '';
                    dts += component.write ? '' : 'readonly ';
                    dts += component.name + (component.nullable ? '?' : '') + ': ';

                    dts += typeScriptTypeOfEntity(component).replace(/\?/g, ' | null | undefined') + ';\n';

                }
                else if (component.type == 'method') {
                    
                    dts +=  '\n\t' + typeScriptDocumentationWithDocumentation(component.doc).split('\n').join('\n\t') + '\n\t';
                    dts += (component.isPrivate ? 'private ' : '') + (component.isStatic ? 'static ' : '') + component.name + ((type == 'interface' && component.optional) ? '?' : '') + '(';

                    // Some methods have the first parameter "optional" but the rest required of which TypeScript complains;
                    // In CoreUI this means that the "optional" parameter may be given a value of undefined which may have
                    // special semantics; in these cases, the optional marker is removed from the first parameter but the
                    // type retains its union with null and undefiend
                    let isParametersObjectNullable = true;
                    if (component.argumentsObject.length) {
                        isParametersObjectNullable = component.argumentsObject.reduce((acc, val) => acc && val.nullable, true);
                    }

                    if (component.arguments.length) dts += component.arguments.map((arg) => {
                        let name = typeScriptArgNameWithEntity(arg);
                        if (!isParametersObjectNullable) {
                            name = name.replace(/\?/g, '');
                        }
                        // Rest parameters cannot be nullable
                        if (name.startsWith('...')) {
                            name = name.replace(/\?/g, '');
                        }
                        return name + ': ' + typeScriptTypeOfEntity(arg).replace(/\?/g, ' | null | undefined');
                    }).join(', ');

                    if (component.argumentsObject.length) {
                        dts += ', {' + component.argumentsObject.filter((arg) => arg.name != '...').map((arg) => `${arg.name}: ${arg.name}`).join(', ') + '}';

                        dts += component.argumentsObject.reduce((acc, val) => acc && val.nullable, true) ? '?' : '';

                        dts += ': {';

                        dts += component.argumentsObject.map(arg => typeScriptArgNameWithArgObjectEntity(arg) + ': ' + typeScriptTypeOfEntity(arg).replace(/\?/g, ' | null | undefined')).join(', ') + '}';
                    }

                    dts += '): ' + typeScriptTypeOfEntity(component.return).replace(/\?/g, ' | null | undefined') + ';\n\n';

                }
            }

            dts += '}\n';
        }

    }

    return dts;
}

exports.createTypeScriptDefinitionsWithContent = function createTypeScriptDefinitionsWithContent(content, {modules = false} = {modules: false}) {
    console.log("Starting dts generation...");
    const result = allFilesLoaded(content, {returnOutput: true, modules});
    console.log('Dts generation finished.');
    return result;
}

/*
let files = ['_0BMCoreUI.js', '_1BMCell.js', '_2BMCollectionViewLayout.js', '_3BMCollectionView.js', '_4BMCollectionViewDataSet.js', '_6BMCollectionViewDelegate.js', 'BMWindowDelegate.js', '_7BMCodeHostCore.js'
, 'BMView_v2.5.js', 'BMLayoutConstraint_v2.5.js', 'BMLayoutEditor.js', 'BMAttributedLabelView.js', 'BMLayoutVariableProvider.js', 'BMMenu.js'];

let filesLoaded = 0;
let content = '';

for (let file of files) {
    content += fs.readFileSync(file, 'utf8');
}

allFilesLoaded(content);

(function loadFile(index) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', files[index] + '?' + Math.random(), true);
    xhr.setRequestHeader('Accept', 'text/plain');
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.overrideMimeType('text/plain');
    
    xhr.onload = function () {
        filesLoaded++;
        
        content += xhr.responseText;
        
        if (filesLoaded < files.length) {
            loadFile(filesLoaded);
        }
        else {
            allFilesLoaded(content);
        }
    }

    xhr.send();
    
});
*/