import { getDesignForLionLoginScreen } from './LionLoginScreen/getDesign.js';
import { getDesignForLionInputPassword } from './LionInputPassword/getDesign.js';

import { LionLoginScreen } from '../../LionLoginScreen/LionLoginScreen.js';
import { LionInputPassword } from '../../LionPagination/LionInputPassword.js

export function provideWindows10LoginScreenDesigns() {
  LionLoginScreen.provideDesign(getDesignForLionLoginScreen());
  LionInputPassword.provideDesign(getDesignForLionInputPassword());
}
