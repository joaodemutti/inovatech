import type {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
} from '@playwright/test/reporter';

function stripAnsi(text: string): string {
    return text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

class TextReporter implements Reporter {
    private lines: string[] = [];

    onBegin(config: FullConfig, suite: Suite) {
        this.lines.push('PLAYWRIGHT TEST REPORT');
        this.lines.push('======================');
        this.lines.push(`Total tests: ${suite.allTests().length}`);
        this.lines.push('');
    }

    onTestEnd(test: TestCase, result: TestResult) {
        const status =
            result.status === 'passed'
                ? 'PASSED'
                : result.status === 'failed'
                    ? 'FAILED'
                    : result.status.toUpperCase();

        this.lines.push(`[${status}] ${test.titlePath().join(' > ')}`);

        if (result.error?.message) {
            this.lines.push('Error:');
            this.lines.push(stripAnsi(result.error.message));
        }

        this.lines.push('');
    }

    async onEnd(result: FullResult) {
        this.lines.push('======================');
        this.lines.push(`Final status: ${result.status.toUpperCase()}`);

        const fs = await import('fs');
        fs.writeFileSync('playwright-report.txt', this.lines.join('\n'), 'utf8');

        console.log('Finished. Report saved to playwright-report.txt');
    }
}

export default TextReporter;