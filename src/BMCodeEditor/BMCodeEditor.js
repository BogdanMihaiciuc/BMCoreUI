import {YES, NO, BMExtend} from '../Core/BMCoreUI'

// @type BMCodeEditorLanguage

/**
 * @deprecated - This enum will be removed in a future version
 * ---
 * An enum containing the languages that code editors should support.
 */
export var BMCodeEditorLanguage = Object.freeze({ // <enum>
	/**
	 * Indicates that the code editor should edit javascript.
	 */
	Javascript: 'javascript', // <enum>
	/**
	 * Indicates that the code editor should edit CSS.
	 */
	CSS: 'css', // <enum>
	/**
	 * Indicates that the code editor should edit JSON.
	 */
	JSON: 'json', // <enum>
	/**
	 * Indicates that this code editor should edit typescript.
	 */
	Typescript: 'typescript' // <enum>
});

// @endtype

// @type BMCodeEditor

/**
 * @deprecated - This class will be removed in a future version
 * ---
 * The code editor is an abstract type that defines the methods and properties that should be exposed by a code editor.
 * The code editor itself should not be used directly, instead one of the two subtypes - BMCodeMirrorCodeEditor or BMMonacoCodeEditor - shoud be used.
 */
export function BMCodeEditor() {}; // <constructor>

BMCodeEditor.prototype = {
	
	/**
	 * The DOM Node managed by this code editor.
	 */
	_container: undefined, // <DOMNode>
	get container() {
		return this._container;
	},
	
	delegate: undefined, // <BMCodeEditorDelegate>
	
	/**
	 * Designated initializer. Must be invoked by all other initializers. 
	 * Subtypes that override this method must invoke the base implementation at some point during their initialization.
	 * @param container <DOMNode>							The DOM Node managed by this code editor.
	 * {
	 *	@param code <String, nullable>						If specified, the code editor will be initialized with the given code content.
	 *	@param language <BMCodeEditorLanguage, nullable>	Defaults to BMCodeEditorLanguage.Javascript. The language this code editor should use.
	 * }
	 * @return <BMCodeEditor>								This code editor.
	 */
	initWithContainer: function (container) {
		this._container = container;
		
		return this;
	},

	/**
	 * Controls the code on which the code editor operates.
	 */
	get code() {}, // <String>
	set code(code) {},

	/**
	 * Will be set to `YES` when the current configuration requires the code to be transpiled before it can be executed by the browser environment.
	 * When this property returns YES, the `transpiledCode()` method should be invoked to retrieve the transpiled code.
	 */
	get requiresTranspilation() { // <Boolean>
		return NO;
	},

	/**
	 * Returns the transpiled code.
	 * This method should not be invoked when `requiresTranspilation` is set to NO.
	 * @return <String>			The transpiled code.
	 */
	async transpiledCode() { // <String>
		return this.code;
	},
	
	/**
	 * Controls the cursor position in the code editor.
	 * This property is a point where the X coordinate represents the cursor's 0-indexed column and the Y coordinate its 0-indexed line.
	 */
	get cursorPosition() {}, // <BMPoint>
	set cursorPosition(position) {},
	
	/**
	 * Defaults to `NO`. If the code editor supports extensible autocomplete, it should set this property to `YES` during initialization.
	 * If the code editor sets this property to YES, it must override the getter and setter associated with <code>scope</code> property to handle
	 * injecting additional autocomplete symbols.
	 */
	supportsExtensibleAutocomplete: NO, // <Boolean>
	
	/**
	 * Should be overriden by code editors that support extensible autocomplete but do not provide autocomplete 
	 * for builtin ES6 and jQuery types.
	 * Code editors that already provide default autocomplete support for ES6 and jQuery are not required to implement this method.
	 * Sets the builtin libraries to the given code.
	 * The default implementation does nothing.
	 * @param ES6Library <String>							The ES6 definition.
	 * {
	 *	@param jQueryLibrary <String>						The jQuery definition.
	 *	@param additionalLibraries <[String], nullable>		An optional array containing additional libraries that may
	 *														be needed for the environment.
	 * }
	 */
	setBuiltinES6Library: function (ES6Library, args) {},
	
	/**
	 * Should be overriden by code editors that support extensible autocomplete.
	 * When this method is invoked, the code editor should enable autocomplete definitions for the given imports.
	 * If this method has already been previously invoked, the previous imports autocomplete definition should be
	 * replaced by this new one.
	 * The default implementation does nothing.
	 * @param imports <String>							The imports definition.
	 */
	setImports(imports) {},

	/**
	 * Should be overriden by code editors that support extensible autocomplete.
	 * When this method is invoked, the code editor should enable autocomplete definitions for the given external library.
	 * If this method has already been previously invoked with the same name, the previous autocomplete definition should be
	 * replaced by this new one.
	 * The default implementation does nothing.
	 * @param name <String>			The name of the library.
	 * {
	 * 	@param code <String>		The contents of the library.
	 * }
	 */
	addExternalLibraryNamed(name, args) {},

	/**
	 * Should be overriden by code editors that support extensible autocomplete.
	 * When this method is invoked with the name of a library that was previously added, it will be removed from the autocomplete
	 * definitions. If that library was not previously imported, this method does nothing.
	 * The default implementation does nothing.
	 * @param name <String>			The name of the library.
	 * {
	 * 	@param code <String>		The contents of the library.
	 * }
	 */
	removeExternalLibraryNamed(name) {},

	/**
	 * Should be overriden by code editors that support extensible autocomplete.
	 * When this method is invoked with the name of a library that was previously added, it returns `YES`. 
	 * If that library was not previously imported, this method returns `NO`.
	 * The default implementation returns `NO` in all cases.
	 * @param name <String>			The name of the library.
	 * @return <Boolean>			`YES` if the library was imported, `NO` otherwise.
	 */
	hasExternalLibraryNamed(name) {
		return NO;
	},
	
	/**
	 * Controls the autocomplete scope in which the code runs.
	 * Editors that support extensible autocomplete should override this property to handle injecting
	 * additional symbols into the autocomplete scope.
	 */
	get scope() {}, // <Object<String, String>, nullable>
	set scope(scope) {},
	
	/**
	 * Should be invoked to insert the given text at the current cursor position.
	 * @param text <String>		The text to insert.
	 */
	insertText: function (text) {},
	
	/**
	 * Should be invoked to cause this code editor to acquire keyboard focus.
	 */
	acquireFocus: function () {},
	
	
	/**
	 * Should be invoked to cause this code editor to resign keyboard focus.
	 */
	resignFocus: function () {},
	
	/**
	 * Should be invoked whenever this code editor is resized for any reason.
	 */
	resized: function () {},
	
	/**
	 * Should be invoked when this code editor is no longer needed and should be destroyed.
	 */
	release: function () {}
	
};

// @endtype

// @type BMCodeMirrorCodeEditor

/**
 * @deprecated - This class will be removed in a future version
 * ---
 * The code mirror code editor is a concrete implementation of BMCodeEditor that uses CodeMirror as its editor.
 */
export function BMCodeMirrorCodeEditor() {} // <constructor>

/**
 * @deprecated - This constructor will be removed in a future version
 * ---
 * Constructs and returns a code mirror code editor using the specified container.
 * @param container <DOMNode>			The DOM Node managed by this code mirror code editor.
 * {
 *	@param code <String, nullable>		If specified, the code mirror code editor will be initialized with the given code content.
 *	@param language <BMCodeEditorLanguage, nullable>	Defaults to BMCodeEditorLanguage.Javascript. The language this code editor should use.
 * }
 * @return <BMCodeMirrorCodeEditor>		A code editor.
 */
export function BMCodeMirrorCodeEditorMakeWithContainer(container, args) {
	return (new BMCodeMirrorCodeEditor()).initWithContainer(container, {code: args && args.code, language: args && args.language});
};

BMExtend(BMCodeMirrorCodeEditor.prototype, BMCodeEditor.prototype, {
	
	/**
	 * The CodeMirror instance managed by this code editor.
	 */
	_codeMirror: undefined, // <CodeMirror>
	
	//@override - BMCodeEditor
	/**
	 * Designated initializer. Must be invoked by all other initializers. 
	 * Initializes this code mirror code editor using the specified container.
	 * Optionally, the initial code may be provided as well.
	 * @param container <DOMNode>							The DOM Node managed by this code mirror code editor.
	 * {
	 *	@param code <String, nullable>						If specified, the code mirror code editor will be initialized with the given code content.
	 *	@param language <BMCodeEditorLanguage, nullable>	Defaults to BMCodeEditorLanguage.Javascript. The language this code editor should use.
	 * }
	 * @return <BMCodeMirrorCodeEditor>						This code editor.
	 */
	 initWithContainer: function (container, args) {
		BMCodeEditor.prototype.initWithContainer.call(this, container);
		 
		this._codeMirror = CodeMirror(this.container, {
			mode: (args && args.language) || BMCodeEditorLanguage.Javascript,
			theme: "eclipse",
			lineNumbers: YES,
			firstLineNumber: 0,
			matchBrackets: YES,
			extraKeys: {
				"Ctrl-Q": function (codeMirror) {
					cm.foldCode(cm.getCursor());
				},
				'Ctrl-S': function (codeMirror) {
					
				}
			},
			foldGutter: true,
			gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
			indentUnit: 4
		});

		this.container.querySelectorAll(".CodeMirror")[0].style.height = '100%';
		
		var self = this;
		this._codeMirror.on('change', function () {
			if (self.delegate && self.delegate.codeEditorContentsDidChange) {
				self.delegate.codeEditorContentsDidChange(self);
			}
		});
		
		var code = args && args.code;
		if (!code) return this;
		
		this.code = code;
		
		return this;
	 },

	/**
	 * Controls the code on which the code editor operates.
	 */
	get code() { // <String>
		return this._codeMirror.getValue();
	},
	set code(code) {
		this._codeMirror.setValue(code);
	},
	
	get cursorPosition() { // <BMPoint>
		var cursor = this._codeMirror.getCursor();
		
		return BMPointMake(cursor.ch, cursor.line);
	},
	set cursorPosition(position) {
		this._codeMirror.setCursor({ch: position.x, line: position.y});
		this._codeMirror.scrollIntoView({ch: 0, line: position.y});
	},
	
	// @override - BMCodeEditor
	insertText: function (text) {
		var document = this._codeMirror.getDoc();
		var cursor = this._codeMirror.getCursor();
		
		document.replaceRange(text, cursor);
	},
	
	// @override - BMCodeEditor
	acquireFocus: function () {
		this._codeMirror.focus();
	},
	
	// @override - BMCodeEditor
	resignFocus: function () {
		// unsupported
	},
	
	// @override - BMCodeEditor
	resized: function () {
		this._codeMirror.refresh();
	}
	
});

// @endtype

// @type BMMonacoCodeEditor extends BMCodeEditor

/**
 * @deprecated - This class will be removed in a future version
 * ---
 * The monaco code editor is a concrete implementation of BMCodeEditor that uses Monaco as its editor.
 */
export function BMMonacoCodeEditor() {} // <constructor>

var _BMMonacoCodeEditorThemesCreated = NO;
var _BMMonacoCodeEditorDefaultsSet = NO;

/**
 * Invoked when creating a monaco code editor.
 * Creates the default themes if they weren't already created.
 */
BMMonacoCodeEditor.createThemes = function () {
	if (_BMMonacoCodeEditorThemesCreated) return;
	
	_BMMonacoCodeEditorThemesCreated = YES;
	
	monaco.editor.defineTheme('BMMonacoCodeEditorTheme', {
		base: 'vs',
		inherit: YES,
		rules: [
			{token: 'comment', foreground: 'CCCCCC'},
			{token: 'string', foreground: 'BC670F', background: 'FDFBF3'},
			{token: 'keyword', foreground: '6700B9'},
			{token: 'type', foreground: '6700B9'},
			{token: 'identifier', foreground: '434343'},
			{token: 'delimiter', foreground: '434343'},
			{token: 'number', foreground: '7552c1', background: 'E7E6FD'},
			{token: 'tag', foreground: '434343'},
			{token: 'attribute.name', foreground: 'D4430D'},
			{token: 'attribute.value', foreground: '43A202'},
			{token: 'attribute.value.number', foreground: '5AA201', background: 'F6FAEB'},
			{token: 'attribute.value.unit', foreground: '5AA201', background: 'F6FAEB'},
			{token: 'attribute.value.hex', foreground: '43A202'},
			{token: 'tag.css', foreground: '3A77BF'}
		]
	});
	
	monaco.editor.defineTheme('BMMonacoCodeEditorThemeDark', {
		base: 'vs-dark',
		inherit: YES,
		rules: [
			{token: 'comment', foreground: '555555'},
			{token: 'string', foreground: 'ee9452', background: 'FDFBF3'},
			{token: 'keyword', foreground: 'a349f5'},
			{token: 'type', foreground: 'a349f5'},
			{token: 'identifier', foreground: 'bcbcbc'},
			{token: 'delimiter', foreground: 'bcbcbc'},
			{token: 'number', foreground: 'a37df1', background: 'E7E6FD'},
			{token: 'tag', foreground: 'bcbcbc'},
			{token: 'attribute.name', foreground: 'ff7b41'},
			{token: 'attribute.value', foreground: '80dc4c'},
			{token: 'attribute.value.number', foreground: '92d94b', background: 'F6FAEB'},
			{token: 'attribute.value.unit', foreground: '92d94b', background: 'F6FAEB'},
			{token: 'attribute.value.hex', foreground: '80dc4c'},
			{token: 'tag.css', foreground: '5fa1ec'}
		]
	});
}

/**
 * @deprecated - This constructor will be removed in a future version
 * ---
 * Constructs and returns a code mirror code editor using the specified container.
 * @param container <DOMNode>			The DOM Node managed by this code mirror code editor.
 * {
 *	@param code <String, nullable>		If specified, the code mirror code editor will be initialized with the given code content.
 *	@param language <BMCodeEditorLanguage, nullable>	Defaults to BMCodeEditorLanguage.Javascript. The language this code editor should use.
 * }
 * @return <BMCodeMirrorCodeEditor>		A code editor.
 */
export function BMMonacoCodeEditorMakeWithContainer(container, args) {
	return (new BMMonacoCodeEditor()).initWithContainer(container, {code: args && args.code, language: args && args.language});
};

BMExtend(BMMonacoCodeEditor.prototype, BMCodeEditor.prototype, {
	
	/**
	 * The monaco instance managed by this code editor.
	 */
	_monaco: undefined, // <Monaco>
	
	_autocompleteLibraries: undefined, // <Promise>
	
	_rootES6Library: undefined, // <Promise>
	
	_rootjQueryLibrary: undefined, // <Promise>

	_importsLibrary: undefined, // <Promise>

	_externalLibraries: undefined, // <Object<String, Promise>>

	_language: undefined, // <BMCodeEditorLanguage>

	_darkModeQuery: undefined, // <MediaQueryList>

	_darkModeQueryCallback: undefined, // <Function>
	
	//@override - BMCodeEditor
	/**
	 * Designated initializer. Must be invoked by all other initializers. 
	 * Initializes this code mirror code editor using the specified container.
	 * Optionally, the initial code may be provided as well.
	 * @param container <DOMNode>							The DOM Node managed by this monaco code editor.
	 * {
	 *	@param code <String, nullable>						If specified, the monaco code editor will be initialized with the given code content.
	 *	@param language <BMCodeEditorLanguage, nullable>	Defaults to BMCodeEditorLanguage.Javascript. The language this code editor should use.
	 * }
	 * @return <BMMonacoCodeEditor>							This code editor.
	 */
	 initWithContainer: function (container, args) {
		BMCodeEditor.prototype.initWithContainer.call(this, container);
		
		BMMonacoCodeEditor.createThemes();
		
		var options = {
			folding: YES,
			fontLigatures: NO,
			formatOnPaste: YES,
			mouseWheelZoom: YES,
			scrollBeyondLastLine: YES,
			value: args && args.code,
			language: (args && args.language) || BMCodeEditorLanguage.Javascript,
			fontFamily: 'Menlo, Meslo LG S, Fira Code, Monaco, monospace',
			theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? 'BMMonacoCodeEditorThemeDark' : 'BMMonacoCodeEditorTheme',
			disableLayerHinting: YES
		};

		this._language = args.language || BMCodeEditorLanguage.Javascript;
		
		if (!_BMMonacoCodeEditorDefaultsSet) {
			_BMMonacoCodeEditorDefaultsSet = YES;

			monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				allowNonTsExtensions: YES,
				experimentalDecorators: YES,
				strict: YES,
				inlineSourceMap: YES,
				module: monaco.languages.typescript.ModuleKind.CommonJS,
				noImplicitUseStrict: YES
			});
			
			monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				allowNonTsExtensions: YES,
				experimentalDecorators: YES,
				strict: YES,
				inlineSourceMap: YES,
				inlineSources: YES,
				noImplicitUseStrict: YES,
				alwaysStrict: NO,
				module: monaco.languages.typescript.ModuleKind.None,
				useDefineForClassFields: NO,
			});
		}
		
		this._monaco = monaco.editor.create(container, options);
		
		var self = this;
		this._monaco.onDidChangeModelContent(function (event) {
			if (self.delegate && self.delegate.codeEditorContentsDidChange) {
				self.delegate.codeEditorContentsDidChange(self);
			}
		});

		this._externalLibraries = {};

		this._darkModeQueryCallback = (event) => {
			if (event.matches) {
				monaco.editor.setTheme('BMMonacoCodeEditorThemeDark');
			}
			else {
				monaco.editor.setTheme('BMMonacoCodeEditorTheme');
			}
		};

		this._darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
		this._darkModeQuery.addListener(this._darkModeQueryCallback);
		
		return this;
	 },
	 
	/**
	 * Sets the builtin libraries to the given code. If the builtin libraries are already defined, they will be replaced with the given definitions.
	 * @param ES6Library <String>		The ES6 definition.
	 * {
	 *	@param jQueryLibrary <String>	The jQuery definition.
	 *	@param additionalLibraries <[String], nullable>		An optional array containing additional libraries that may
	 *														be needed for the environment.
	 * }
	 */
	setBuiltinES6Library: function (ES6Library, args) {
		if (this._language === BMCodeEditorLanguage.Javascript) {
			this._rootES6Library = monaco.languages.typescript.javascriptDefaults.addExtraLib(ES6Library, 'ES6.d.ts');
			this._rootjQueryLibrary = monaco.languages.typescript.javascriptDefaults.addExtraLib(args.jQueryLibrary, 'jQuery.d.ts');
			if (args.additionalLibraries) {
				this._autocompleteLibraries = monaco.languages.typescript.javascriptDefaults.addExtraLib(args.additionalLibraries.join('\n'), 'additional.d.ts');
			}
			else {
				if (this._autocompleteLibraries) this._autocompleteLibraries.dispose();
				this._autocompleteLibraries = undefined;
			}
		}
		else {
			this._rootES6Library = monaco.languages.typescript.typescriptDefaults.addExtraLib(ES6Library, 'ES6.d.ts');
			this._rootjQueryLibrary = monaco.languages.typescript.typescriptDefaults.addExtraLib(args.jQueryLibrary, 'jQuery.d.ts');
			if (args.additionalLibraries) {
				this._autocompleteLibraries = monaco.languages.typescript.typescriptDefaults.addExtraLib(args.additionalLibraries.join('\n'), 'additional.d.ts');
			}
			else {
				if (this._autocompleteLibraries) this._autocompleteLibraries.dispose();
				this._autocompleteLibraries = undefined;
			}
		}
	},

	// @override - BMCodeEditor
	setImports(imports) {
		if (this._language === BMCodeEditorLanguage.Javascript) {
			this._importsLibrary = monaco.languages.typescript.javascriptDefaults.addExtraLib(imports, 'node_modules/@types/imports/index.d.ts');
		}
		else {
			this._importsLibrary = monaco.languages.typescript.typescriptDefaults.addExtraLib(imports, 'node_modules/@types/imports/index.d.ts');
		}
	},

	// @override - BMCodeEditor
	addExternalLibraryNamed(name, args) {
		if (this._language === BMCodeEditorLanguage.Javascript) {
			this._externalLibraries[name] = monaco.languages.typescript.javascriptDefaults.addExtraLib(args.code, 'node_modules/@types/' + name);
		}
		else {
			this._externalLibraries[name] = monaco.languages.typescript.typescriptDefaults.addExtraLib(args.code, 'node_modules/@types/' + name);
		}
	},

	// @override - BMCodeEditor
	removeExternalLibraryNamed(name) {
		if (this._externalLibraries[name]) {
			this._externalLibraries[name].dispose();
			delete this._externalLibraries[name];
		}
	},

	// @override - BMCodeEditor
	hasExternalLibraryNamed(name) {
		return name in this._externalLibraries;
	},

	/**
	 * Controls the code on which the code editor operates.
	 */
	get code() { // <String>
		return this._monaco.getValue();
	},
	set code(code) {
		this._monaco.setValue(code);
	},

	/**
	 * Will be set to `YES` when the current configuration requires the code to be transpiled before it can be executed by the browser environment.
	 * When this property returns YES, the `transpiledCode()` method should be invoked to retrieve the transpiled code.
	 */
	get requiresTranspilation() { // <Boolean>
		return this._language === BMCodeEditorLanguage.Typescript;
	},

	/**
	 * Returns the transpiled code.
	 * This method should not be invoked when `requiresTranspilation` is set to NO.
	 * @return <String>			The transpiled code.
	 */
	transpiledCode() { // <String>
		return new Promise((resolve, reject) => {
			let workerPromise;
			if (monaco.languages.typescript.getLanguageWorker) {
				workerPromise = monaco.languages.typescript.getLanguageWorker("typescript");
			}
			else {
				workerPromise = monaco.languages.typescript.getTypeScriptWorker();
			}

			workerPromise.then((worker) => {
				// if there is an uri available
				if (this._monaco.getModel()) {
					worker(this._monaco.getModel().uri).then((client) => {
						if (this._monaco.getModel())
							client.getEmitOutput(this._monaco.getModel().uri.toString()).then(function (result) {
								resolve(result.outputFiles[0].text);
							});
					});
				}
			});
		});
	},
	
	get cursorPosition() { // <BMPoint>
		var cursor = this._monaco.getSelection();
		
		return BMPointMake(cursor.startColumn, cursor.startLineNumber);
	},
	set cursorPosition(position) {
		var selection = new monaco.Range(position.y, position.x, position.y, position.x);
		this._monaco.setSelection(selection);
		this._monaco.revealPositionInCenter({lineNumber: position.y, column: position.x});
	},
	
	// @override - BMCodeEditor
	insertText: function (text) {
		this._monaco.executeEdits('insertSnippet', [{
			range: this._monaco.getSelection(),
			text: text,
			forceMoveMarkers: true
		}]);
	},
	
	// @override - BMCodeEditor
	acquireFocus: function () {
		this._monaco.focus();
	},
	
	// @override - BMCodeEditor
	resignFocus: function () {
		// unsupported
	},
	
	// @override - BMCodeEditor
	resized: function () {
		this._monaco.layout();
	},
	
	get supportsExtensibleAutocomplete() {
		return YES;
	},
	
	get scope() {
		return this._scope;
	},
	
	set scope(scope) {
		//if (this._autocompleteLibrary) this._autocompleteLibrary.dispose();
		
		this._scope = scope;
		if (this._language === BMCodeEditorLanguage.Javascript) {
			this._autocompleteLibrary = monaco.languages.typescript.javascriptDefaults.addExtraLib(scope, 'BMMonacoCodeEditor.d.ts');
		}
		else {
			this._autocompleteLibrary = monaco.languages.typescript.typescriptDefaults.addExtraLib(scope, 'BMMonacoCodeEditor.d.ts');
		}
	},
	
	release: function () {
		this._monaco.dispose();
		if (this._autocompleteLibrary) this._autocompleteLibrary.dispose();
		if (this._autocompleteLibraries) this._autocompleteLibraries.dispose();
		if (this._rootES6Library) this._rootES6Library.dispose();
		if (this._rootjQueryLibrary) this._rootjQueryLibrary.dispose();
		if (this._importsLibrary) this._importsLibrary.dispose();

		this._darkModeQuery.removeListener(this._darkModeQueryCallback);

		Object.keys(this._externalLibraries).forEach(key => this._externalLibraries[key].dispose());
	}
	
});

// @endtype