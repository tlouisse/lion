import { getDesignForLionLoginScreen } from './LionLoginScreen/getDesign.js';
import { getDesignForLionInputPassword } from './LionInputPassword/getDesign.js';
// import { getDesignForUIPortalCard } from './UIPortalCard/getDesign.js';
// import { getDesignForUIPortalFooterContent } from './UIPortalFooterContent/getDesign.js';

import { LionLoginScreen } from '../../LionLoginScreen/LionLoginScreen.js';
import { LionInputPassword } from '../../LionInputPassword/LionInputPassword.js';

export function provideIngportalDesigns() {
  LionLoginScreen.provideDesign(getDesignForLionLoginScreen());
  LionInputPassword.provideDesign(getDesignForLionInputPassword());
}
