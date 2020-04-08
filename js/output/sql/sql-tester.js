var SQLTester = function(options) {
    this.initialize(options);
    this.bindTestContext();
};

SQLTester.prototype = new OutputTester();


/**
 * Small collection of some utility functions to tack onto the function
 * constructor itself.  Does not store state so don't require an object.
 */
SQLTester.Util = {
    /**
     * Obtains a list of all of the tables with information on each table
     *
     * @param db The database to perform the query on
     * @return An array of objects with the fields:
     *   - table: string
     *   - rowCount: number
     *   - rowsMsg: i18n header string for handlebars
     *   - columns: array of object of extra properties on each column
     *      cid, name, type, notnul, dflt_value, pk
     */
    getTables: function(db) {
        var tablesResult = db.exec("SELECT name FROM sqlite_master WHERE " +
                "type='table' and tbl_name != 'sqlite_sequence';");
        var tables = tablesResult.length === 0? [] :
                tablesResult[0].values.map(function(t) {
            return t[0];
        });

        tables = tables.map(function(table) {
            var rowCount = SQLTester.Util.getRowCount(db, table);
            // NOTE(danielhollas): It seems we need to define this var here
            // so that it's available in handlebars
            // I18N: SQL table header
            var rowsMsg = i18n.ngettext(
                    "%(num)s row",
                    "%(num)s rows",
                    rowCount);
            var tablesInfoResult = db.exec("PRAGMA table_info(" + table + ")");
            var v = tablesInfoResult[0].values;
            // Return a table object which also contains each column info
            return {
                name: table,
                rowCount: rowCount,
                rowsMsg: rowsMsg,
                columns: v.map(function(v) {
                    return {
                        cid: v[0],
                        name: v[1],
                        type: v[2].toUpperCase(),
                        notnull: v[3],
                        dflt_value: v[4],
                        pk: v[5]
                    };
                })
            };
        });
        return tables;
    },

    /**
     * Obtains the number of rows for the specified table
     *
     * @param db The database to perform the query on
     * @param table The name of the table to query
     */
    getRowCount: function(db, table) {
        var result = db.exec("SELECT count(*) FROM " + table);
        return result[0].values[0][0];
    },

    /**
     * Parses out each statement and calls the callback
     *
     * @param userCode the user code to parse
     * @param callback callback(statement, lineNumber)
     *     statement is the statement to execute (could span multiple lines)
     *     lineNumber is the line of code corresponding to the statement
     *     return false from the callback to cancel executing
     */
    forEachStatement: function(userCode, callback) {

        // Implements a simple state machine by hand which will parse out
        // comments and separate on semicolons.
        var currentStatement = "";
        var lineNumber = 0;
        var state = {
            NORMAL: 1,
            ONE_DASH: 2,
            IN_SINGLE_LINE_COMMENT: 3,
            ONE_SLASH: 4,
            IN_MULTI_LINE_COMMENT: 5,
            IN_MULTI_LINE_COMMENT_PLUS_STAR: 6,
            IN_SINGLE_QUOTE_STRING: 7,
            IN_DOUBLE_QUOTE_STRING: 8,
        };

        var currentState = state.NORMAL;
        for (var i = 0; i < userCode.length; i++) {
            if (userCode[i] === "\n") {
                lineNumber++;
            }
            switch (currentState) {
                case state.NORMAL:
                    if (userCode[i] === "-") {
                        currentState = state.ONE_DASH;
                        continue;
                    } else if (userCode[i] === "'") {
                        currentState = state.IN_SINGLE_QUOTE_STRING;
                    } else if (userCode[i] === "\"") {
                        currentState = state.IN_DOUBLE_QUOTE_STRING;
                    } else if (userCode[i] === "/") {
                        currentState = state.ONE_SLASH;
                        continue;
                    } else if (userCode[i] === ";") {
                        currentStatement = currentStatement.trim();
                        if (callback(currentStatement, lineNumber) === false) {
                            return;
                        }
                        currentStatement = "";
                        continue;
                    }
                    currentStatement += userCode[i];
                    break;
                case state.ONE_DASH:
                    if (userCode[i] === "-") {
                        currentState = state.IN_SINGLE_LINE_COMMENT;
                        continue;
                    }
                    currentStatement += "-" + userCode[i];
                    currentState = state.NORMAL;
                    break;
                case state.IN_SINGLE_LINE_COMMENT:
                    if (userCode[i] === "\n") {
                        currentState = state.NORMAL;
                    }
                    break;
                case state.ONE_SLASH:
                    if (userCode[i] === "*") {
                        currentState = state.IN_MULTI_LINE_COMMENT;
                        continue;
                    }
                    currentStatement += "/" + userCode[i];
                    currentState = state.NORMAL;
                    break;
                case state.IN_MULTI_LINE_COMMENT:
                    if (userCode[i] === "*") {
                        currentState = state.IN_MULTI_LINE_COMMENT_PLUS_STAR;
                        continue;
                    }
                    break;
                case state.IN_MULTI_LINE_COMMENT_PLUS_STAR:
                    if (userCode[i] === "/") {
                        currentState = state.NORMAL;
                        continue;
                    }
                    break;
                case state.IN_SINGLE_QUOTE_STRING:
                    if (userCode[i] === "'") {
                        currentState = state.NORMAL;
                    }
                    currentStatement += userCode[i];
                    break;
                case state.IN_DOUBLE_QUOTE_STRING:
                    if (userCode[i] === "\"") {
                        currentState = state.NORMAL;
                    }
                    currentStatement += userCode[i];
                    break;
                default:
                    throw "Invalid condition met when parsing code";
            }
        }

        if (currentStatement) {
            currentStatement = currentStatement.trim();
            if (currentStatement) {
                callback(currentStatement, lineNumber);
            }
        }
    },
    /**
     * Executes the results with the specified userCode
     *
     * @param db The databaes to run the code on
     * @param userCode The code to run
     * @return An array of result objects
     */
    execWithResults: function(db, userCode) {
        var results = [];
        SQLTester.Util.forEachStatement(userCode, function(statementCode) {
            // Ignore empty statements, this should be caught be linting
            if (!statementCode) {
                return;
            }
            var result =
                SQLTester.Util.execSingleStatementWithResults(db,
                    statementCode);
            if (result) {
                results.push(result);
            }
        });
        return results;
    },
    /**
     * Executes a single statement
     *
     * @param db The database to execute the statement in
     * @param statement The statement to execute
     * @return a result object or if no results returns null
     */
    execSingleStatementWithResults: function(db, statementCode) {
        var stmt = db.prepare(statementCode);
        var o = { values: []};
        while (stmt.step()) {
            if (!o.columns) {
                o.columns = stmt.getColumnNames();
            }
            // Re-map the data so that arrays never contain arrays.
            // Instead each sub-array will be nested in an object.
            // For some unknown reason, handlebars 1.0.5 doesn't like
            // arrays within arrays on Firefox.
            var rowData = stmt.get();
            if (rowData) {
                rowData = rowData.map(function(data) {
                    return { data: data };
                });
            }
            o.values.push({ result: rowData});
        }
        if (o.columns) {
            return o;
        }
        return null;
    }
};

SQLTester.prototype.testMethods = {
    /*
     * Introspect a callback to determine it's parameters and then
     * produces a constraint that contains the appropriate variables
     * and callbacks.
     *
     * This allows much terser definition of callback functions since you
     * don't have to explicitly state the parameters in a separate list.
     */
    constraint: function(callback) {
        var paramText = /^function [^\(]*\(([^\)]*)\)/
            .exec(callback.toString())[1];
        var params = paramText.match(/[$_a-zA-z0-9]+/g);

        for (var key in params) {
            if (params[key][0] !== "$") {
                console.warn("Invalid parameter in constraint " +
                            "(should begin with a '$'): ", params[key]);
                return null;
            }
        }
        return {
            variables: params,
            fn: callback
        };
    },

    initTemplateDB: function(structure) {
        var templateDB = new SQL.Database();
        var templateResults =
            SQLTester.Util.execWithResults(templateDB, structure);
        var templateTables = SQLTester.Util.getTables(templateDB, true);
        templateDB.close();
        return {
            results: templateResults,
            tables: templateTables,
            userCode: structure
        };
    },

    /*
     *
     * @return {success} if the user DB has at least as many tables as
     *  the comparison DB
     */
    matchTableCount: function(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;
        var templateTables = templateDBInfo.tables;

        if (tables.length < templateTables.length) {
            return { success: false };
        }
        return { success: true };
    },

    /**
     * @param templateDBOrCount: Either a template DB to match rows against
     *  or an integer of the amount to match against
     * @return {success} if user table contains same # of rows
     */
    matchTableRowCount: function(templateDBOrCount) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;

        if (templateDBOrCount.tables) {
            var templateTables = templateDBOrCount.tables;
            // Make sure we have similar table info
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                var templateTable = templateTables[i];
                // This checks the actual row count of the whole table which
                // may be different from the result set rows.
                if (templateTable && table.rowCount !== templateTable.rowCount) {
                    return { success: false };
                }
            }
        } else {
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                if (table.rowCount !== templateDBOrCount) {
                    return { success: false };
                }
            }
        }
        return { success: true };
    },

    /**
     * @param templateDBOrCount: Either a template DB to match rows against
     *  or an integer of the amount to match against
     * @return {success} if user table contains same # of columns
     */
    matchTableColumnCount: function(templateDBOrCount) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;

        if (templateDBOrCount.tables) {
            var templateTables = templateDBOrCount.tables;

            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                var templateTable = templateTables[i];

                if (templateTable &&
                    table.columns.length !== templateTable.columns.length) {
                    return { success: false };
                }
            }
        } else {
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                if (table.columns.length !== templateDBOrCount) {
                    return { success: false };
                }
            }
        }

        return { success: true };
    },

    /**
     * @param templateDBInfo: A template DB to match column names
     * @return {success} if user table contains same column names
     *   Note - it could also contain other names,
     *   use matchTableColumnCount if you need to be exact.
     */
    matchTableColumnNames: function(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;
        var templateTables = templateDBInfo.tables;

        if (!tables.length) {
            return { success: false };
        }
        for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var tableColumns = table.columns.map(function(obj) {
                return obj.name;
            });
            var templateTable = templateTables[i];
            for (var c = 0; c < templateTable.columns.length; c++) {
                if (!tableColumns.includes(templateTable.columns[c].name)) {
                    return { success: false };
                }
            }
        }
        return { success: true };
    },

    matchResultCount: function(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        if (results.length !== templateResults.length) {
            return { success: false };
        }
        return { success: true };
    },

    /**
     * @param resultIndex: The index of the result to check
     * @param templateDBOrCount: Either a template DB to match rows against
     *  or an integer of the amount to match against
     */
    matchResultRowCount: function(resultIndex, templateDBOrCount) {
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;

        if (results.length < (resultIndex + 1)) {
            return {success: false};
        }
        if (templateDBOrCount.results && !templateDBOrCount.results[resultIndex]) {
            return {success: false};
        }

        var res = results[resultIndex];
        var targetCount;
        if (templateDBOrCount.results) {
            targetCount = templateDBOrCount.results[resultIndex].values.length;
        } else {
            targetCount = templateDBOrCount;
        }

        if (res.values.length !== targetCount) {
            return { success: false };
        }
        return {success: true};
    },

    /**
     * @param resultIndex: The index of the result to check
     * @param templateDBOrCount: Either a template DB to match columns against
     *  or an integer of the amount to match against
     */
    matchResultColumnCount: function(resultIndex, templateDBOrCount) {
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;

        if (results.length < (resultIndex + 1)) {
            return {success: false};
        }
        if (templateDBOrCount.results && !templateDBOrCount.results[resultIndex]) {
            return {success: false};
        }

        var res = results[resultIndex];
        var targetCount;
        if (templateDBOrCount.results) {
            targetCount = templateDBOrCount.results[resultIndex].columns.length;
        } else {
            targetCount = templateDBOrCount;
        }

        if (res.columns.length !== targetCount) {
            return { success: false };
        }
        return {success: true};
    },

    /**
     * @param resultIndex: The index of the result to check
     * @param templateDB: The templateDB to match row values against
     */
    matchResultRowValues: function(resultIndex, templateDB, options) {
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        options = options || {};

        if (results.length < (resultIndex + 1)) {
            return {success: false};
        }
        if (templateDB.results && !templateDB.results[resultIndex]) {
            return {success: false};
        }
        var result = results[resultIndex];
        var templateResult = templateDB.results[resultIndex];
        if (options.ignoreOrder) {
            // To compare rows while ignoring order,
            // we stringify each row and sort the array of rows,
            // then do an equality check.
            var resultStringified = result.values.map(function(value) {
                return JSON.stringify(value);
            }).sort();
            var templateStringified = templateResult.values.map(function(value) {
                return JSON.stringify(value);
            }).sort();
            if (!_.isEqual(resultStringified, templateStringified)) {
                return { success: false };
            }
        } else {
            for (var i = 0; i < result.values.length; i++) {
                if (!_.isEqual(result.values[i], templateResult.values[i])) {
                    return { success: false };
                }
            }
        }

        return {success: true};
    },

    /**
     * @param resultIndex: The index of the result to check
     * @param templateDB: The templateDB to match column names against
     */
    matchResultColumnNames: function(resultIndex, templateDB) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDB.results;

        if (results.length < templateResults.length) {
            return { success: false };
        }

        var result = results[resultIndex];
        var templateResult = templateResults[resultIndex];
        if (result.columns.length !== templateResult.columns.length) {
            return { success: false };
        }
        for (var c = 0; c < result.columns.length; c++) {
            var col = result.columns[c].toLowerCase().replace(/ /g,'');
            var templateCol =
                templateResult.columns[c].toLowerCase().replace(/ /g,'');
            if (col !== templateCol) {
                return { success: false };
            }
        }
        return { success: true };
    },

    matchResultColumns: function(templateDBInfo, numResults) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        if (results.length < templateResults.length) {
            return { success: false };
        }

        // This allows us to check Step 1 results even if
        //  Step 2 results are not correct, for example.
        numResults = numResults || results.length;
        for (var i = 0; i < numResults; i++) {
            var res = results[i];
            var templateRes = templateResults[i];
            if (!templateRes ||
                (res.columns.length !== templateRes.columns.length)) {
                return { success: false };
            }
            for (var c = 0; c < res.columns.length; c++) {
                var col = res.columns[c].toLowerCase().replace(/ /g,'');
                var templateCol =
                    templateRes.columns[c].toLowerCase().replace(/ /g,'');
                if (col !== templateCol) {
                    return { success: false };
                }
            }
        }
        return { success: true };
    },

    matchResultValues: function(templateDBInfo, exactValues, numResults) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        if (results.length < templateResults.length) {
            return { success: false };
        }

        // This allows us to check Step 1 results even if
        //  Step 2 results are not correct, for example.
        numResults = numResults || results.length;

        // Make sure we have similar results
        for (var i = 0; i < numResults; i++) {
            var res = results[i];
            var templateRes = templateResults[i];
            if (!templateRes ||
                (res.values.length !== templateRes.values.length)) {
                return { success: false };
            }
            if (exactValues) {
                for (var r = 0; r < res.values.length; r++) {
                    // These can be objects
                    if (!_.isEqual(res.values[r], templateRes.values[r])) {
                        return { success: false };
                    }
                }
            }
        }
        return { success: true };
    },

    moreResultsThan(num) {
        var dbInfo = this.userCode;
        var results = dbInfo.results;
        return { success: (results.length > num) };
    },

    /*
     * Creates a new test result (i.e. new challenge tab)
     */
    assertMatch: function(result, description, hint, image) {

        var alternateMessage;
        var alsoMessage;

        if (result.success) {
            alternateMessage = result.message;
        } else {
            alsoMessage = result.message;
        }

        this.testContext.assert(result.success, description, "", {
            structure: hint,
            alternateMessage: alternateMessage,
            alsoMessage: alsoMessage,
            image: image
        });
    },
};


