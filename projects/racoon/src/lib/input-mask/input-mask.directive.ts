import { Directive, ElementRef, HostListener, Input, NgModule, OnInit } from "@angular/core";

@Directive({
    selector: "[rInputMask]"
})
export class InputMaskDirective implements OnInit {

    constructor(private el: ElementRef) {
    }

    @Input() slotChar = "_";

    @Input() showPlaceholder = false;

    @Input("rInputMask") mask: string;

    private oldValue: string;

    private caretPos: number;

    public value: string;

    private static isNumeric(s: string) {
        if (s === " ") {
            return false;
        }
        return !isNaN(Number(s));
    }

    private static isAlpha(s: string) {
        return s.match(/^[a-z]+$/i) !== null;
    }

    @HostListener("input")
    onInput() {
        this.oldValue = this.value;
        this.value = this.el.nativeElement.value;
        if (!this.value) {
            return;
        }
        this.maskValue();
    }


    ngOnInit(): void {
    }

    public maskValue() {
        let maskedValue = "";
        let dif = 0;
        let caretDif = 0;

        for (let i = 0; i < this.mask.length && this.value.length !== i; i++) {
            const maskChar = this.mask.charAt(i + dif);
            const valueChar = this.value.charAt(i);
            if (!InputMaskDirective.isAlpha(valueChar)
                && !InputMaskDirective.isNumeric(valueChar)
                && valueChar !== maskChar) {
                this.value = this.value.substring(0, i) + this.value.substring(i + 1);
                i--;
                caretDif++;
            } else if (maskChar === "9") {
                if (InputMaskDirective.isNumeric(valueChar)) {
                    maskedValue += valueChar;
                } else {
                    this.value = this.value.substring(0, i) + this.value.substring(i + 1);
                    i--;
                }
            } else if (maskChar === "A") {
                if (InputMaskDirective.isAlpha(this.value.charAt(i - dif))) {
                    maskedValue += valueChar;
                } else {
                    this.value = this.value.substring(0, i) + this.value.substring(i + 1);
                    i--;
                }
            } else if (maskChar !== valueChar && maskedValue.charAt(i + dif) !== maskChar) {
                maskedValue += maskChar;
                dif++;
                i--;
            } else {
                maskedValue += maskChar;
            }
        }

        if (this.showPlaceholder) {
            maskedValue = this.fillWithPlaceholder(maskedValue);
            this.oldValue = this.fillWithPlaceholder(this.oldValue);
        }

        this.caretPos = this.getUpdatedCaretPos(maskedValue);
        this.value = maskedValue;
        this.updateInput();
    }

    private updateInput() {
        this.el.nativeElement.value = this.value;
        this.el.nativeElement.selectionStart = this.caretPos;
        this.el.nativeElement.selectionEnd = this.caretPos;
    }

    private getUpdatedCaretPos(maskedValue: string) {
        let caretPos = this.getCaretPos();
        if (caretPos === this.el.nativeElement.value.length) {
            caretPos = maskedValue.length;
        } else if (this.oldValue !== maskedValue) {
            while (caretPos < this.value.length &&
            this.mask.charAt(caretPos) !== "9" &&
            this.mask.charAt(caretPos) !== "A") {
                caretPos++;
            }
        } else {
            caretPos--;
        }
        return caretPos;
    }

    private fillWithPlaceholder(value: string): string {
        if (!value) {
            return value;
        }
        let mask = this.mask.replace(/[9A]/g, this.slotChar);
        mask = mask.substring(value.length, mask.length);
        value = value + mask;
        return value;
    }

    public getCaretPos() {
        return this.el.nativeElement.selectionStart;
    }
}

@NgModule({
    declarations: [
        InputMaskDirective
    ],
    exports: [
        InputMaskDirective
    ]

})
export class InputMaskModule {

}
