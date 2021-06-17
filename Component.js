/** @author XNANSHA Date: 23/04/2019 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/eric/ZManageNotiApp1/model/models",
	"com/eric/ZManageNotiApp1/controller/ListSelector"
], function (UIComponent, Device, models, ListSelector) {
	"use strict";

	return UIComponent.extend("com.eric.ZManageNotiApp1.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
				this.oListSelector = new ListSelector();
		//		this._oErrorHandler = new ErrorHandler(this);
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			var oRouter = this.getRouter();
			if (oRouter) {
				oRouter.initialize();
			}

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},
		
			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			}
	});

});