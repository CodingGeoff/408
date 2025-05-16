// 哈夫曼树节点类
class HuffmanNode {
    constructor(freq, char = null) {
        this.freq = freq;
        this.char = char;
        this.left = null;
        this.right = null;
        this.code = '';
    }
}

// 全局状态管理
const huffmanData = {
    currentStep: 0,
    steps: [],
    codes: {},
    currentFrequencies: [],
    currentChars: [],
    huffmanTree: null
};

// 构建哈夫曼树并记录步骤
function buildHuffmanTree(frequencies, chars) {
    // 创建初始节点
    let nodes = frequencies.map((freq, i) => new HuffmanNode(freq, chars[i]));
    huffmanData.steps.push([...nodes]);

    while (nodes.length > 1) {
        // 按频率排序
        nodes.sort((a, b) => a.freq - b.freq);

        // 取最小的两个节点
        const left = nodes.shift();
        const right = nodes.shift();

        // 创建新节点
        const parent = new HuffmanNode(left.freq + right.freq);
        parent.left = left;
        parent.right = right;

        // 添加到节点列表
        nodes.push(parent);

        // 记录当前步骤
        huffmanData.steps.push([...nodes]);
    }

    huffmanData.huffmanTree = nodes[0];
    generateCodes(huffmanData.huffmanTree);
}

// 生成哈夫曼编码
function generateCodes(node, code = '') {
    if (node.char !== null) {
        node.code = code;
        huffmanData.codes[node.char] = code;
        return;
    }

    if (node.left) generateCodes(node.left, code + '0');
    if (node.right) generateCodes(node.right, code + '1');
}

// 计算平均编码长度
function calculateAverageCodeLength() {
    let totalLength = 0;
    let totalFreq = 0;

    huffmanData.currentChars.forEach((char, i) => {
        const freq = huffmanData.currentFrequencies[i];
        totalLength += freq * huffmanData.codes[char].length;
        totalFreq += freq;
    });

    return totalLength / totalFreq;
}

// 可视化树节点
function visualizeTreeNode(node, container, x, y, width, level) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = `node ${node.char ? 'node-leaf' : 'node-internal'} absolute`;
    nodeDiv.style.left = `${x}px`;
    nodeDiv.style.top = `${y}px`;
    nodeDiv.textContent = node.char || node.freq;
    container.appendChild(nodeDiv);

    if (node.left) {
        const leftX = x - width / 2;
        const leftY = y + 60;
        
        // 绘制左边连线
        const edge = document.createElement('div');
        edge.className = 'tree-edge tree-edge-left';
        edge.style.width = '2px';
        edge.style.height = '60px';
        edge.style.left = `${x}px`;
        edge.style.top = `${y + 20}px`;
        edge.style.transform = `rotate(-45deg)`;
        container.appendChild(edge);

        visualizeTreeNode(node.left, container, leftX, leftY, width / 2, level + 1);
    }

    if (node.right) {
        const rightX = x + width / 2;
        const rightY = y + 60;

        // 绘制右边连线
        const edge = document.createElement('div');
        edge.className = 'tree-edge tree-edge-right';
        edge.style.width = '2px';
        edge.style.height = '60px';
        edge.style.left = `${x}px`;
        edge.style.top = `${y + 20}px`;
        edge.style.transform = `rotate(45deg)`;
        container.appendChild(edge);

        visualizeTreeNode(node.right, container, rightX, rightY, width / 2, level + 1);
    }
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    const testCustomInputBtn = document.getElementById('test-custom-input');
    const customPrevStepBtn = document.getElementById('custom-prev-step');
    const customNextStepBtn = document.getElementById('custom-next-step');

    // 绑定自定义测试按钮事件
    testCustomInputBtn.addEventListener('click', () => {
        const frequenciesInput = document.getElementById('custom-frequencies').value;
        const charsInput = document.getElementById('custom-chars').value;

        if (!frequenciesInput) {
            alert('请输入频率');
            return;
        }

        try {
            // 解析输入频率
            const frequencies = frequenciesInput.split(',').map(item => parseInt(item.trim(), 10));

            // 验证频率
            if (frequencies.some(isNaN) || frequencies.some(freq => freq <= 0)) {
                alert('请输入有效的正整数频率');
                return;
            }

            // 解析输入字符
            let chars = [];
            if (charsInput) {
                chars = charsInput.split(',').map(item => item.trim());

                // 验证字符
                if (chars.length !== frequencies.length) {
                    alert('字符数量必须与频率数量相同');
                    return;
                }
            } else {
                // 生成默认字符 A, B, C, ...
                chars = Array(frequencies.length).fill().map((_, i) => String.fromCharCode(65 + i));
            }

            // 重置状态
            huffmanData.currentStep = 0;
            huffmanData.steps = [];
            huffmanData.codes = {};

            // 设置当前频率和字符
            huffmanData.currentFrequencies = frequencies;
            huffmanData.currentChars = chars;

            // 构建哈夫曼树并保存每一步
            buildHuffmanTree(frequencies, chars);

            // 显示结果消息
            const resultMessage = document.getElementById('custom-result-message');
            resultMessage.className = 'bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-lg';
            resultMessage.innerHTML = `
                <div class="flex items-center">
                    <div class="bg-green-100 text-green-500 rounded-full p-2 mr-3">
                        <i class="fa fa-check"></i>
                    </div>
                    <div>
                        <p class="font-bold">哈夫曼编码生成成功</p>
                        <p>输入频率: [${frequencies.join(', ')}]</p>
                    </div>
                </div>
            `;

            // 可视化哈夫曼树
            const customTreeContainer = document.getElementById('custom-tree-visualization');
            customTreeContainer.innerHTML = '';

            // 创建最终树的可视化
            const treeTitle = document.createElement('h4');
            treeTitle.className = 'text-xl font-bold mb-4';
            treeTitle.textContent = '哈夫曼树';
            customTreeContainer.appendChild(treeTitle);

            // 简化版树可视化
            visualizeSimpleHuffmanTree(huffmanData.huffmanTree, customTreeContainer);

            // 显示编码结果
            const codingResultContainer = document.getElementById('custom-coding-result');
            codingResultContainer.innerHTML = '';

            const codingTitle = document.createElement('h4');
            codingTitle.className = 'text-xl font-bold mb-4';
            codingTitle.textContent = '编码结果';
            codingResultContainer.appendChild(codingTitle);

            // 创建编码表
            const table = document.createElement('table');
            table.className = 'w-full text-left';
            table.innerHTML = `
                <thead>
                    <tr class="bg-gray-100">
                        <th class="table-cell font-bold">字符</th>
                        <th class="table-cell font-bold">频率</th>
                        <th class="table-cell font-bold">编码</th>
                        <th class="table-cell font-bold">长度</th>
                    </tr>
                </thead>
                <tbody>
                    ${chars.map(char => {
                        const freq = frequencies[chars.indexOf(char)];
                        const code = huffmanData.codes[char];
                        return `
                            <tr>
                                <td class="table-cell font-medium">${char}</td>
                                <td class="table-cell">${freq}</td>
                                <td class="table-cell">
                                    ${code.split('').map(bit =>
                                        `<span class="code-bit ${bit === '0' ? 'code-0' : 'code-1'}">${bit}</span>`
                                    ).join('')}
                                </td>
                                <td class="table-cell">${code.length}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            `;

            codingResultContainer.appendChild(table);

            // 显示答案
            const answerContainer = document.getElementById('custom-answer');
            const count = Object.values(huffmanData.codes).filter(code => code.length >= 3).length;

            answerContainer.innerHTML = `
                <h4 class="font-bold mb-2 text-dark">编码长度分析</h4>
                <p class="text-gray-700 mb-2">
                    编码长度不小于3的字符有 <span class="font-bold text-primary">${count}</span> 个。
                </p>
                <div class="flex items-center">
                    <span class="mr-2">平均编码长度：</span>
                    <span class="font-bold">${calculateAverageCodeLength().toFixed(2)}</span>
                </div>
            `;

            // 显示结果容器
            document.getElementById('custom-result-container').classList.remove('hidden');

            // 平滑滚动到结果
            document.getElementById('custom-result-container').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            alert('输入格式错误：' + error.message);
        }
    });

    // 绑定步骤控制按钮事件
    customPrevStepBtn.addEventListener('click', () => {
        if (huffmanData.currentStep > 0) {
            huffmanData.currentStep--;
            updateCustomVisualization();
        }
    });

    customNextStepBtn.addEventListener('click', () => {
        if (huffmanData.currentStep < huffmanData.steps.length - 1) {
            huffmanData.currentStep++;
            updateCustomVisualization();
        }
    });
});

// 更新自定义可视化
function updateCustomVisualization() {
    const container = document.getElementById('custom-tree-visualization');
    container.innerHTML = '';

    // 显示当前步骤的树
    const currentNodes = huffmanData.steps[huffmanData.currentStep];
    visualizeSimpleHuffmanTree(currentNodes[0], container);

    // 更新按钮状态
    document.getElementById('custom-prev-step').disabled = huffmanData.currentStep === 0;
    document.getElementById('custom-next-step').disabled = huffmanData.currentStep === huffmanData.steps.length - 1;
}