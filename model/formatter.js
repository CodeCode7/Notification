sap.ui.define([], function () {
	"use strict";
	return {
		appText: function (sStatus) {
			var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			switch (sStatus) {
				case "VIM_COQUA":
					return resourceBundle.getText("VIM_CQNAme");
				case "EB_APPSHPCART":
					return resourceBundle.getText("EB_SCNAme");
				case "EB_APPPO":
					return resourceBundle.getText("EB_PONAme");
				default:
					return sStatus;
			}
		}
	};
});