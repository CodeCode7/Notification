/** @author XNANSHA Date: 23/04/2019 */
sap.ui.define([
	"com/eric/ZManageNotiApp1/controller/BaseController",
	"sap/m/MessageToast",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Text',
	"com/eric/ZManageNotiApp1/model/formatter",
	"sap/ui/core/routing/History"
], function(BaseController, MessageToast, Button, Dialog, Text, formatter, History) {
	"use strict";

	return BaseController.extend("com.eric.ZManageNotiApp1.controller.Detail", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ManageNotiApp3.view.View2
		 */
		onInit: function() {

			var oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
			});

			this.setModel(oViewModel, "detailView");

			/*  var dataModel1 = this.getOwnerComponent().getModel("mainService");
			this.getView().setModel(dataModel1);*/

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("View2").attachMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function(oEvent) {
			/************************Binding with Odata*************************************/

			//	console.log("on object matched");

			var args = oEvent.getParameter("arguments");
			var SystemId = args.SystemId;
			var Userid = args.Userid;
			var WiId = args.WiId;

			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("PUSH_NOTIFSet", {
					SystemId: SystemId,
					Userid: Userid,
					WiId: WiId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
			/**************************end***********************************/

			/************************Binding with json data*************************************/
			/*    var selectedArguments = oEvent.getParameter("arguments");
			    var selectedRecord = JSON.parse(selectedArguments.selectedobj);

			    var obj = {
			      "Objects": selectedRecord
			    };
			    var navigationobjModel = new sap.ui.model.json.JSONModel();
			    navigationobjModel.setData(obj);
			    this.getView().setModel(navigationobjModel, "navigationModel");*/

			/**************************end***********************************/
		},

		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			/*  var sPath = oElementBinding.getPath(),
			    oResourceBundle = this.getResourceBundle(),
			    oObject = oView.getModel().getObject(sPath),
			    sObjectId = oObject.WiId,
			    sObjectName = oObject.NotifTxt,
			    oViewModel = this.getModel("detailView");

			  this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			  oViewModel.setProperty("/saveAsTileTitle",oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			  oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			  oViewModel.setProperty("/shareSendEmailSubject",
			    oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			  oViewModel.setProperty("/shareSendEmailMessage",
			    oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));*/
		},

		onNavBack: function() {
			/* window.history.go(-1);*/
			/*       var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			      this.getRouter().getRoute("View1");*/

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("View1", true);
			}
			
			this.oRefreshFLPList();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ManageNotiApp3.view.View2
		 */
		//  onBeforeRendering: function() {
		//
		//  },

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ManageNotiApp3.view.View2
		 */
		//  onAfterRendering: function() {
		//
		//  },

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ManageNotiApp3.view.View2
		 */
		//  onExit: function() {
		//
		//  },

		onPressOpenTask: function(oEvent) {
			var oBusyDialog = new sap.m.BusyDialog();
			//	var oViewModel = this.getModel("detailView");
		//	oBusyDialog.open();
			var that = this;
			var oViewModel = this.getModel("detailView");
			oViewModel.setProperty("/busy", true);
			var AppnamePO = this.getResourceBundle().getText("EB_POiD"),
				AppnameSC = this.getResourceBundle().getText("EB_SCiD"),
				AppnameInvoice = this.getResourceBundle().getText("VIM_CQiD"),
				AppSemantecObject, AppPath, Param1, Param2;
			var hash;
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var oItem = oEvent.getSource();
			var oCtx = oItem.getBindingContext();
			var oModelrefresh = oItem.getModel();
			var SystemId = oCtx.getProperty("SystemId"),
				Userid = oCtx.getProperty("Userid"),
				WiId = oCtx.getProperty("WiId"),
				PoNumber = oCtx.getProperty("Identifier"),
				AppName = oCtx.getProperty("Appname");

			//try {

			if (AppName === AppnamePO) {
				AppSemantecObject = "SRMPurchaseOrder-approve";
				AppPath = "SRMPurchaseOrder-approve&/detail/WorkflowTask";

				oCrossAppNavigator.isIntentSupported(["SRMPurchaseOrder-approve"])
					.done(function(aResponses) {
						hash = "SRMPurchaseOrder-approve&/detail/WorkflowTask" + "(WorkItemId='" + WiId + "',PONumber='" + PoNumber + "')";
						//  hash = that.getResourceBundle().getText("EB_POpath") + "(WorkItemId='" + WiId + "',PONumber='" + PoNumber + "')";
					})
					.fail(function() {
						new sap.m.MessageToast("Provide corresponding intent to navigate");
					});

			} else if (AppName === AppnameSC) {

				hash = "ZAPPROVE_SC-approve&/detail/WorkflowTaskCollection" + "(SAP__Origin='" + SystemId + "',WorkitemID='" + WiId + "')";

			} else if (AppName === AppnameInvoice) {
				/*------------added code---------------*/
				//code to get GUID for VIM navigation
				var InvNum = oCtx.getProperty("Identifier");
				var vimModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/OTX/PF05_DATA;mo;v=3;");
				vimModel.read("/Nodes(SAP__Origin='" + SystemId +
					"',nodeId='PS35_VIM_MPOEX_INV',wobjType='PS35_VIM_MPOEX',workplaceId='WP_INBOX',deviceType='DESKTOP')/Objects", {
						async: false,
						success: function(oData, response) {
							var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/Z_PUSH_NTF_SRV/");
							oModel.read("/INV_WEBIDSet(InvDocNo='" + InvNum + "')", {
								async: false,
								success: function(oData, response) {
									var GUID = oData.Id;
									hash = "InvoiceManagement-display?letterBox=false&nodeId=PS35_VIM_MPOEX_INV&semanticNavEnabled=false&system=" +
										SystemId +
										"&wobjType=PS35_VIM_MPOEX&workplaceId=WP_INBOX&/detail/" + GUID;
								},
								error: function(oData, response) {
									console.log("Issue happened during VIM FIORI Navigation");
								}

							});
						},
						error: function(oData, response) {
							console.log("Issue happened while initiating VIM model");
						}
					});
			}

			//	console.log(hash);
			//navigation to hash
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});
			oViewModel.setProperty("/busy", false);
		
			//calling update from backend
			this.onUpdateOperation(oCtx);
		
			oModelrefresh.refresh();

			this.onNotificationCountRefresh(oCtx);
			
			this.oRefreshFLPList();


			
		/*	var oList = sap.ui.getCore().byId("notiList");
			var oModel = oList.getModel();
			//oModel.refresh();
			oModel.updateBindings(true);
			console.log("oList:" + oList);*/

		//	oBusyDialog.close();

			/*	} catch (err) {

					console.log("error:" + err);
				//	oBusyDialog.close();

				}finally{
					oBusyDialog.close();
				}*/

		},

		onUpdateOperation: function(oCtx) {
			//Update backend status
			var that = this;
			var oEntry = {};
			var oModel = this.getModel();
				//oModel.setDeferredGroups(["notiUpdateGroup"]);
			var oViewModel = this.getModel("detailView");
			oViewModel.setProperty("/busy", true);
			oEntry.SystemId = oCtx.getProperty("SystemId"),
			oEntry.Userid = oCtx.getProperty("Userid"),
			oEntry.WiId = oCtx.getProperty("WiId"),
			oEntry.Createdat = oCtx.getProperty("Createdat");
			oEntry.TaskId = oCtx.getProperty("TaskId");
			oEntry.Identifier = oCtx.getProperty("Identifier");
			oEntry.NotifTxt = oCtx.getProperty("NotifTxt");
			oEntry.Appname = oCtx.getProperty("Appname");
			oEntry.ReadFlg = "X";

			oModel.update("/PUSH_NOTIFSet(SystemId='" + oEntry.SystemId + "',Userid='" + oEntry.Userid + "',WiId='" + oEntry.WiId + "')",
				oEntry, {
					method: "PUT",
					async: false,
					success: function(data) {
						oModel.refresh(true);
						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.getRoute("View1");
					//	that.onNotificationCountRefresh(oCtx);
						oViewModel.setProperty("/busy", false);
					//	that.otest();
					//	console.log("Data updated sucessfully");
					//	console.log("Data updated sucessfully 1");
					},
					error: function(e) {
						console.log("Update operation failed for" + "/PUSH_NOTIFSet(SystemId='" + oEntry.SystemId + "',Userid='" + oEntry.Userid +
							"',WiId='" + oEntry.WiId);
							oViewModel.setProperty("/busy", false);
					}
				});
				oViewModel.setProperty("/busy", false);

			//  this.onRefresh();
		},

		onNotificationCountRefresh: function(oCtx) {
			var oReadFlag = "";
			oReadFlag = oCtx.getProperty("ReadFlg");
		
			if (oReadFlag !== undefined && oReadFlag !== "X") {
			
				var notiControl = sap.ui.getCore().byId("notification");
				if (notiControl !== undefined) {
					var oldCount = notiControl.getFloatingNumber();
					if (oldCount != 0 || oldCount > 0) {
						notiControl.setFloatingNumber(oldCount - 1);
					}
				}
			}

		},

		oRefreshFLPList: function() {

			var oList = sap.ui.getCore().byId("notiList");
		//	console.log("oList:" + oList);
			
			if(oList!== undefined){
	
			oList.getBinding("items").refresh();
			}
	
		},

		OnPressDelete: function(oEvent) {
			//  var that=this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("View1");
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getOwnerComponent().oListSelector.deleteMasterListSelection(oEvent.getSource());
			//this.onMessageWarningDialogPress(oEvent);
			//  this.getOwnerComponent().oListSelector.deleteMasterListSelection(oEvent.getSource());
			//  var oModelrefresh = oEvent.getSource().getModel();
			//    oModelrefresh.refresh();
			// this._getDialog().open();
		},

		/**
		 *Delete from database 
		 */
		onDeleteOperation: function(oCtx) {
			var that = this;

			var oModel = this.getModel();
			var SystemId = oCtx.getProperty("SystemId"),
				Userid = oCtx.getProperty("Userid"),
				WiId = oCtx.getProperty("WiId");

			oModel.remove("/PUSH_NOTIFSet(SystemId='" + SystemId + "',Userid='" + Userid + "',WiId='" + WiId + "')", {
				method: "DELETE",
				success: function(data) {
					oModel.refresh(true);
					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
					oRouter.getRoute("View1");
					//	console.log("delete success");
				},
				error: function(e) {
					//	console.log("delete error");
				}
			});
		},

		onMessageWarningDialogPress: function(oEvent) {
			var that = this;
			var oItem = oEvent.getSource();
			//	console.log(oItem);
			var oCtx = oItem.getBindingContext();

			var dialog = new Dialog({
				title: 'Warning',
				type: 'Message',
				state: 'Warning',
				content: new Text({
					text: 'The notification will be removed from system and no longer will be accessible. Are you sure you want to delete the notification?'
				}),

				beginButton: new Button({
					text: 'OK',
					press: function() {
						that.onDeleteOperation(oCtx);
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			dialog.open();
		}

	});

});