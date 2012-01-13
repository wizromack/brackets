define(function(require, exports, module) {
    // Load dependent modules
    var ProjectManager      // Load from brackets.test
    ,   PreferencesManager  // Load from brackets.test
    ,   SpecRunnerUtils     = require("./SpecRunnerUtils.js")
    ;

    describe("ProjectManager", function() {

        var testPath = SpecRunnerUtils.getTestPath("/spec/ProjectManager-test-files");

        beforeEach(function() {
            SpecRunnerUtils.beforeTestWindow( this, function( testWindow ) {
                // Load module instances from brackets.test
                ProjectManager = testWindow.brackets.test.ProjectManager;
                PreferencesManager = testWindow.brackets.test.PreferencesManager;
            });
        });

        afterEach(function() {
            SpecRunnerUtils.afterTestWindow();
        });

        describe("createNewItem", function() {
            // TODO (jasonsj): test Commands.FILE_NEW
            it("should create a new file with a given name", function() {
                var didCreate = false, gotError = false;

                SpecRunnerUtils.loadProject( testPath );

                runs(function() {
                    // skip rename
                    ProjectManager.createNewItem(testPath, "Untitled.js", true)
                        .done(function() { didCreate = true; })
                        .fail(function() { gotError = true; });
                });
                waitsFor(function() { return didCreate && !gotError; }, "ProjectManager.createNewItem() timeout", 1000);

                var error, stat, complete = false;
                var filePath = testPath + "/Untitled.js";
                runs(function() {
                    brackets.fs.stat(filePath, function(err, _stat) {
                        error = err;
                        stat = _stat;
                        complete = true;
                    });
                });

                waitsFor(function() { return complete; }, 1000);

                var unlinkError = brackets.fs.NO_ERROR;
                runs(function() {
                    expect(error).toBeFalsy();
                    expect(stat.isFile()).toBe(true);

                    // delete the new file
                    complete = false;
                    brackets.fs.unlink(filePath, function(err) {
                        unlinkError = err;
                        complete = true;
                    });
                });
                waitsFor(function() {
                        return complete && unlinkError == brackets.fs.NO_ERROR;
                    }
                    , "unlink() failed to cleanup Untitled.js, err=" + unlinkError
                    , 1000
                );
            });

            it("should fail when a file already exists", function() {
                var didCreate = false, gotError = false;

                SpecRunnerUtils.loadProject( testPath );

                runs(function() {
                    // skip rename
                    ProjectManager.createNewItem(testPath, "file.js", true)
                        .done(function() { didCreate = true; })
                        .fail(function() { gotError = true; });
                });
                waitsFor(function() { return !didCreate && gotError; }, "ProjectManager.createNewItem() timeout", 1000);

                runs(function() {
                    expect(gotError).toBeTruthy();
                    expect(didCreate).toBeFalsy();
                });
            });

            it("should fail when a file name matches a directory that already exists", function() {
                var didCreate = false, gotError = false;

                SpecRunnerUtils.loadProject( testPath );

                runs(function() {
                    // skip rename
                    ProjectManager.createNewItem(testPath, "directory", true)
                        .done(function() { didCreate = true; })
                        .fail(function() { gotError = true; });
                });
                waitsFor(function() { return !didCreate && gotError; }, "ProjectManager.createNewItem() timeout", 1000);

                runs(function() {
                    expect(gotError).toBeTruthy();
                    expect(didCreate).toBeFalsy();
                });
            });

            it("should fail when file name contains special characters", function() {
                var chars = "/?*:;{}<>\\";
                var i = 0;
                var len = chars.length;
                var charAt, didCreate, gotError;

                SpecRunnerUtils.loadProject( testPath );

                for (i = 0; i < len; i++) {
                    didCreate = false;
                    gotError = false;
                    charAt = chars.charAt(i);

                    runs(function() {
                        // skip rename
                        ProjectManager.createNewItem(testPath, "file" + charAt + ".js", true)
                            .done(function() { didCreate = true; })
                            .fail(function() { gotError = true; });
                    });
                    waitsFor(function() { return !didCreate && gotError; }, "ProjectManager.createNewItem() timeout", 1000);

                    runs(function() {
                        expect(gotError).toBeTruthy();
                        expect(didCreate).toBeFalsy();
                    });
                }
            });
        });

    });
});
