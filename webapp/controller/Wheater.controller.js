sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "../utils/wheaterCity",
        "sap/ui/model/Filter",
        "sap/m/MessageBox",
        "sap/m/MessageToast"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, wheaterApi, Filter, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("wheater.wheater.controller.Wheater", {
            onInit: function () {
                var oView = this.getView();

                this.oSF = oView.byId("searchField");
                this.callLocationBrowser();
            },
            onAfterRendering: function () {
                this.oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            },
            callLocationBrowser: function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        console.log(position.coords.latitude + " ==  " + position.coords.longitude)
                        var controller = this;
                        wheaterApi.getNearbyCities(position.coords.latitude, position.coords.longitude,
                            function (jsonBack) {
                                // console.log(jsonBack.data);
                                if (jsonBack.data[0]) {
                                    controller.buscaWheater(jsonBack.data[0].name, jsonBack.data[0].countryCode);
                                }
                            }.bind(this))
                    }.bind(this));
                }
            },
            onSearch: function (event) {
                wheaterApi.clearDebbounce();
                var query = event.getParameter("query"),
                    suggestionItem = event.getParameter("suggestionItem"),
                    modelTela = this.getView().getModel("modelTela");
                if (suggestionItem != undefined) {
                    var pathSelected = suggestionItem.getBindingContext("modelTela").getPath(),
                        itemSelected = modelTela.getProperty(pathSelected);
                    
                    this.buscaWheater(itemSelected.name, itemSelected.countryCode);

                } else {
                    var selected = modelTela.getProperty("/citySelected");
                    if (selected != "" && selected != undefined && selected != null) {
                        this.buscaWheater(selected);
                    }
                }
            },
            buscaTeste: function () {
                this.buscaWheater("Lisboa", "PT");
            },
            buscaWheater: function (city, country) {
                var modelTela = this.getView().getModel("modelTela");
                this.getView().setBusy(true);
                wheaterApi.getWheater(city, country, function (data) {
                    if (data.weather[0]) {
                        data.weather = data.weather[0];
                    }
                    modelTela.setProperty("/Wheater", data)
                    this.getView().setBusy(false);
                }.bind(this), function (error) {
                    modelTela.setProperty("/Wheater", null)
                    MessageBox.error(this.oResourceBundle.getText("errorCidadeNaoEncontrada"));
                    this.getView().setBusy(false);
                }.bind(this));
            },
            liveChange: function (event) {
                var query = event.getSource().getProperty("value");
                this.buscaCities(query);
            },
            buscaCities: function (query) {
                console.log("passou");
                if (query != "" && query != undefined && query != null) {
                    wheaterApi.debounce(
                        function () {
                            wheaterApi.getCities(query, function (jsonBack) {
                                this.getView().getModel("modelTela").setProperty("/Cities", jsonBack.data);
                                this.setSuggest(query);
                            }.bind(this))
                        }.bind(this), 1000);
                }
            },
            setSuggest: function (sValue) {
                var aFilters = [];
                if (sValue) {
                    aFilters = [
                        new Filter([
                            new Filter("name", function (sDes) {
                                return (sDes || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                            })
                        ], false)
                    ];
                }

                this.oSF.getBinding("suggestionItems").filter(aFilters);
                this.oSF.suggest();
            },
            onSuggest: function (event) {
                var sValue = event.getParameter("suggestValue");
                this.setSuggest(sValue);
            }
        });
    });