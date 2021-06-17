/** @author XNANSHA Date: 23/04/2019 */
sap.ui.define([
	"com/eric/ZManageNotiApp1/controller/BaseController",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function(BaseController, Device, Filter, FilterOperator, MessageToast) {
	"use strict";

	return BaseController.extend("com.eric.ZManageNotiApp1.controller.Master", {

		onInit: function() {
			/*this below code for get the JSON Model form Manifest.json file*/
			var oList = this.byId("list1");

			var oViewModel = this._createViewModel();
			this.setModel(oViewModel, "masterView");
			/*	var dataModel = this.getOwnerComponent().getModel("tableData");
				this.getView().setModel(dataModel, "DataModel");*/
			//var iOriginalBusyDelay = oList.getBusyIndicatorDelay();
			//	sap.ui.getCore().byId("list1").getBinding("items").refresh();

			this._oList = oList;
			this._oListFilterState = {
				aFilter: [],
				aSearch: []
			};

			//	oList.attachEventOnce("updateFinished", function() {
			// Restore original busy indicator delay for the list
			//		oViewModel.setProperty("/delay", iOriginalBusyDelay);
			//	});

			this.getView().addEventDelegate({
				onBeforeFirstShow: function() {
					this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
					//	this.getRouter().getTargets().display("loadingPage");
				}.bind(this)
			});

			//oList.getModel().refresh();
			this.getRouter().getRoute("View1").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
			//this.getRouter().getTargets().display("loadingPage");
			

		},
		onSelectionChange: function(oEvent) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		_showDetail: function(oItem) {
			var bReplace = !Device.system.phone;
			/*	this.getRouter().navTo("object", {
					objectId : oItem.getBindingContext().getProperty("WiId")
				}, bReplace);*/

			var oCtx = oItem.getBindingContext();

			this.getRouter().navTo("View2", {
				SystemId: oCtx.getProperty("SystemId"),
				Userid: oCtx.getProperty("Userid"),
				WiId: oCtx.getProperty("WiId")
			});
		},

		_onMasterMatched: function() {
			this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
				function(mParams) {
					if (mParams.list.getMode() === "None") {
						return;
					}

					var SystemId = mParams.firstListitem.getBindingContext().getProperty("SystemId");
					var Userid = mParams.firstListitem.getBindingContext().getProperty("Userid");
					var WiId = mParams.firstListitem.getBindingContext().getProperty("WiId");

					this.getRouter().navTo("View2", {
						SystemId: SystemId,
						Userid: Userid,
						WiId: WiId
					}, true);
					//	this.getRouter().getTargets().display("loadingPage");
				}.bind(this),
				function(mParams) {
					if (mParams.error) {
						return;
					}
					this.getRouter().getTargets().display("detailNoObjectsAvailable");
				}.bind(this)
			);
		},

		_createViewModel: function() {
			return new sap.ui.model.json.JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: this.getResourceBundle().getText("masterListNoDataText"),
				sortBy: "CustomerName",
				groupBy: "None"
			});
		},

		onNavBack: function() {
			this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
			var href2 = this.oCrossAppNav.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},

		/**
		 * To open filter screen 
		 */
		onOpenViewSettings: function() {
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = sap.ui.xmlfragment("com.eric.ZManageNotiApp1.view.ViewSettingsDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);
				// forward compact/cozy style into Dialog
				this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			this._oViewSettingsDialog.open();
		},

		onSearch: function(oEvent) {
			var aFilters = [];
			var aCaptions = [];
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
				return;
			}

			var sQuery = oEvent.getParameter("query");

			if (sQuery) {

				this._oListFilterState.aSearch = [new Filter("NotifTxt", FilterOperator.Contains, sQuery)];

			} else {
				this._oListFilterState.aSearch = [];
			}

			this._applyFilterSearch();

		},

	
		onRefresh: function() {
			this._oList.getBinding("items").refresh();
		},

		_applyFilterSearch: function() {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				oViewModel = this.getModel("masterView");
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else if (this._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			}

		},
		/**
		 * After list data is available, this handler method updates the
		 * master list counter and hides the pull to refresh control, if
		 * necessary.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the master list object counter after new data is loaded
			this._updateListItemCount(oEvent.getParameter("total"));
			// hide pull to refresh if necessary
			this.byId("pullToRefresh").hide();
		},

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount: function(iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oList.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				this.getModel("masterView").setProperty("/title", sTitle);
			}
		},

		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters
		 * are applied to the master list, which can also mean that the currently
		 * applied filters are removed from the master list, in case the filter
		 * settings are removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog: function(oEvent) {

			var aFilterItems = oEvent.getParameters().filterItems,
				//	var aFilterItems = oEvent.getParameter("selectedContexts"),
				aFilters = [],
				aCaptions = [];

			if (aFilterItems.length != 2) {
				aFilterItems.forEach(function(oItem) {
					//	console.log("getkey value" + oItem.getKey());

					if (oItem.getKey() == "Filter1") {
						//		console.log("getkey value1 " + oItem.getKey());
						aFilters.push(new Filter("ReadFlg", FilterOperator.EQ, "X"));
					}
					if (oItem.getKey() == "Filter2") {
						//		console.log("getkey value2 " + oItem.getKey());
						aFilters.push(new Filter("ReadFlg", FilterOperator.EQ, ""));
					}

					aCaptions.push(oItem.getText());

				});
			} else if (aFilterItems.length >= 2) {
				//	console.log("both filter selected");
				var oFilter1 = new sap.ui.model.Filter("ReadFlg", sap.ui.model.FilterOperator.EQ, "X");
				var oFilter2 = new sap.ui.model.Filter("ReadFlg", sap.ui.model.FilterOperator.EQ, "");
				var aArrayWhichContainsBothPreviousFilters = [];
				// Step 2: add these two filters to an array
				aArrayWhichContainsBothPreviousFilters.push(oFilter1);
				aArrayWhichContainsBothPreviousFilters.push(oFilter2);

				// Step 3: create a filter based on the array of filters
				aFilters = new sap.ui.model.Filter({
					filters: aArrayWhichContainsBothPreviousFilters,
					and: false
				});

			}

			if (aFilterItems.length === 0) {
				//	console.log("aFilterItems.length inside filter");
				aFilters = [];
				aFilters.push(new Filter("ReadFlg", FilterOperator.EQ, "NN")); //to remove filter selection
					aCaptions.push("<No Filter Selected>");
			}
			//	console.log("aFilterItems.length"+aFilterItems.length);
			this._oListFilterState.aFilter = aFilters;
			this._updateFilterBar(aCaptions.join(", "));
			this._applyFilterSearch();

		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar: function(sFilterBarText) {
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
		}

	});

});