/* Maths tips articles. Add a new article by copying one object below. Maths: $...$ inline, $$...$$ on its own line. */
const POSTS = [
  {
    slug: "laws-of-indices",
    title: "The Laws of Indices Explained Simply",
    date: "2026-10-21",
    level: "JSS3 - SS3",
    summary: "The six rules of indices, with worked examples and the mistakes students make most often.",
    body: `
<p>An <b>index</b> (or power) tells you how many times to multiply a number by itself. In $a^n$, $a$ is the <b>base</b> and $n$ is the <b>index</b>. Learn these rules and most indices questions become easy.</p>
<h2>The rules</h2>
<ul>
<li><b>Multiplying, same base: add the powers.</b> $a^m \times a^n = a^{m+n}$</li>
<li><b>Dividing, same base: subtract the powers.</b> $a^m \div a^n = a^{m-n}$</li>
<li><b>Power of a power: multiply the powers.</b> $(a^m)^n = a^{mn}$</li>
<li><b>Zero index:</b> $a^0 = 1$ (for any $a \neq 0$)</li>
<li><b>Negative index: flip it.</b> $a^{-n} = \dfrac{1}{a^n}$</li>
<li><b>Fractional index: a root.</b> $a^{\frac{1}{n}} = \sqrt[n]{a}$</li>
</ul>
<h2>Worked examples</h2>
<p><b>1.</b> $2^3 \times 2^4 = 2^{3+4} = 2^7 = 128$</p>
<p><b>2.</b> $\dfrac{5^6}{5^4} = 5^{6-4} = 5^2 = 25$</p>
<p><b>3.</b> $(3^2)^3 = 3^{2\times 3} = 3^6 = 729$</p>
<p><b>4.</b> $5^{-2} = \dfrac{1}{5^2} = \dfrac{1}{25}$</p>
<p><b>5.</b> $27^{\frac{1}{3}} = \sqrt[3]{27} = 3$</p>
<h2>Mistakes to avoid</h2>
<ul>
<li>The add/subtract rules only work when the <b>bases are the same</b>. $2^3 \times 3^2$ cannot be simplified by adding powers.</li>
<li>$(a+b)^2$ is <b>not</b> $a^2 + b^2$. It is $a^2 + 2ab + b^2$.</li>
<li>$2^{-3}$ is <b>not</b> negative. It equals $\dfrac{1}{8}$.</li>
</ul>
<p><b>Try this:</b> simplify $\dfrac{4^5 \times 4^{-2}}{4^{1}}$. (Answer: $4^{5-2-1} = 4^2 = 16$.)</p>`
  },
  {
    slug: "laws-of-logarithms",
    title: "Logarithms Made Clear: The Key Laws",
    date: "2026-10-21",
    level: "SS1 - SS3",
    summary: "Understand logarithms as 'powers in reverse', then use the four laws to solve exam questions.",
    body: `
<p>A logarithm answers the question: <b>"What power do I raise the base to, to get this number?"</b></p>
<p>$$\log_a x = y \iff a^y = x$$</p>
<p>For example $\log_2 8 = 3$ because $2^3 = 8$, and $\log_{10} 1000 = 3$ because $10^3 = 1000$.</p>
<h2>The laws</h2>
<ul>
<li>$\log_a (xy) = \log_a x + \log_a y$</li>
<li>$\log_a \left(\dfrac{x}{y}\right) = \log_a x - \log_a y$</li>
<li>$\log_a (x^n) = n \log_a x$</li>
<li>$\log_a a = 1$ and $\log_a 1 = 0$</li>
</ul>
<h2>Worked examples</h2>
<p><b>1.</b> $\log_2 8 + \log_2 4 = 3 + 2 = 5$, and $\log_2 (8 \times 4) = \log_2 32 = 5$. The two agree.</p>
<p><b>2.</b> Simplify $\log 50 + \log 2$. Add means multiply: $\log (50 \times 2) = \log 100 = 2$ (base 10).</p>
<p><b>3.</b> Solve $2^x = 7$. Take logs of both sides: $x \log 2 = \log 7$, so $x = \dfrac{\log 7}{\log 2} \approx 2.81$.</p>
<h2>Mistakes to avoid</h2>
<ul>
<li>$\log(x + y)$ is <b>not</b> $\log x + \log y$. The law is for <b>products</b>, not sums.</li>
<li>You cannot take the log of zero or a negative number.</li>
</ul>`
  },
  {
    slug: "solving-linear-equations",
    title: "How to Solve Linear Equations Step by Step",
    date: "2026-10-21",
    level: "JSS1 - SS1",
    summary: "A simple, repeatable method for finding the unknown, with checks so you know you are right.",
    body: `
<p>A linear equation has an unknown (usually $x$) with no powers. The goal is always the same: <b>get $x$ alone on one side</b>. Whatever you do to one side, do to the other.</p>
<h2>The method</h2>
<ol>
<li>Expand any brackets.</li>
<li>Collect the $x$ terms on one side and the numbers on the other.</li>
<li>Divide by the number in front of $x$.</li>
<li><b>Check</b> by putting your answer back into the original equation.</li>
</ol>
<h2>Worked examples</h2>
<p><b>1.</b> $3x + 5 = 20$. Subtract 5: $3x = 15$. Divide by 3: $x = 5$. Check: $3(5) + 5 = 20$. Correct.</p>
<p><b>2.</b> $2(x - 3) = x + 4$. Expand: $2x - 6 = x + 4$. Subtract $x$: $x - 6 = 4$. Add 6: $x = 10$. Check: $2(7) = 14$ and $10 + 4 = 14$. Correct.</p>
<p><b>3.</b> $\dfrac{x}{3} + 2 = 6$. Subtract 2: $\dfrac{x}{3} = 4$. Multiply by 3: $x = 12$.</p>
<h2>Mistakes to avoid</h2>
<ul>
<li>When you move a term across the equals sign, its sign changes.</li>
<li>Multiply <b>every</b> term when you clear a fraction.</li>
</ul>`
  },
  {
    slug: "quadratic-equations",
    title: "Quadratic Equations: Factorising and the Formula",
    date: "2026-10-21",
    level: "SS1 - SS3",
    summary: "Two reliable ways to solve $ax^2 + bx + c = 0$, and how to choose between them.",
    body: `
<p>A quadratic equation has the form $ax^2 + bx + c = 0$. It usually has two solutions.</p>
<h2>Method 1: Factorising</h2>
<p>Solve $x^2 + 5x + 6 = 0$. Find two numbers that multiply to $6$ and add to $5$: they are $2$ and $3$.</p>
<p>$$(x + 2)(x + 3) = 0 \implies x = -2 \text{ or } x = -3$$</p>
<h2>Method 2: The quadratic formula</h2>
<p>Use it when factorising is hard:</p>
<p>$$x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$</p>
<p>Solve $2x^2 - 3x - 2 = 0$. Here $a = 2$, $b = -3$, $c = -2$.</p>
<p>$b^2 - 4ac = 9 + 16 = 25$, so $x = \dfrac{3 \pm 5}{4}$, giving $x = 2$ or $x = -\dfrac{1}{2}$.</p>
<h2>The discriminant</h2>
<p>The number $b^2 - 4ac$ tells you how many real solutions exist: positive means two, zero means one repeated solution, negative means none.</p>
<h2>Mistakes to avoid</h2>
<ul>
<li>Move everything to one side so the equation equals zero <b>before</b> factorising.</li>
<li>Watch the signs of $b$ and $c$ when you substitute into the formula.</li>
</ul>`
  }
];
